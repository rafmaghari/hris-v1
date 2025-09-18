<?php

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use App\Models\LeaveAccrualLog;
use App\Models\LeaveSettingsTemplate;
use App\Models\LeaveType;
use App\Models\User;
use App\Models\UserLeaveSetting;
use App\Services\LeaveAccrualService;
use Carbon\Carbon;

beforeEach(function () {
    $this->accrualService = new LeaveAccrualService();

    // Create test data
    $this->user          = User::factory()->create();
    $this->leaveType     = LeaveType::factory()->create(['name' => 'Vacation Leave']);
    $this->leaveTemplate = LeaveSettingsTemplate::factory()->create([
        'leave_type_id'     => $this->leaveType->id,
        'accrual_type'      => LeadAccrualType::ACCRUAL,
        'accrual_frequency' => LeadAccrualFrequencyType::MONTHLY,
        'accrual_amount'    => 2.5,
        'max_cap'           => 30.0,
        'allow_carry_over'  => true,
        'max_carry_over'    => 10.0,
    ]);

    $this->userLeaveSetting = UserLeaveSetting::factory()->create([
        'user_id'                    => $this->user->id,
        'leave_settings_template_id' => $this->leaveTemplate->id,
        'start_date'                 => Carbon::today()->subMonths(6),
        'accrual_type'               => LeadAccrualType::ACCRUAL,
        'accrual_frequency'          => LeadAccrualFrequencyType::MONTHLY,
        'accrual_amount'             => 2.5,
        'max_cap'                    => 30.0,
        'allow_carry_over'           => true,
        'max_carry_over'             => 10.0,
        'current_balance'            => 15.0,
        'carried_over'               => 0.0,
    ]);
});

describe('processYearEndCarryOver', function () {
    test('processes carry-over within limit', function () {
        $yearEndDate = Carbon::createFromDate(2024, 12, 31);

        $this->accrualService->processYearEndCarryOver($this->userLeaveSetting, $yearEndDate);

        $this->userLeaveSetting->refresh();

        expect($this->userLeaveSetting->current_balance)->toEqual(10.0);
        expect($this->userLeaveSetting->carried_over)->toEqual(10.0);

        // Check logs
        $carryOverLog = LeaveAccrualLog::where('type', LeaveAccrualLog::TYPE_CARRY_OVER)->first();
        expect($carryOverLog)->not->toBeNull();
        expect($carryOverLog->amount)->toEqual(10.0);
        expect($carryOverLog->balance_before)->toEqual(15.0);
        expect($carryOverLog->balance_after)->toEqual(10.0);

        $forfeitureLog = LeaveAccrualLog::where('type', LeaveAccrualLog::TYPE_DEDUCTION)->first();
        expect($forfeitureLog)->not->toBeNull();
        expect($forfeitureLog->amount)->toEqual(-5.0);
    });

    test('processes carry-over when balance is less than max carry-over', function () {
        $this->userLeaveSetting->update(['current_balance' => 8.0]);
        $yearEndDate = Carbon::createFromDate(2024, 12, 31);

        $this->accrualService->processYearEndCarryOver($this->userLeaveSetting, $yearEndDate);

        $this->userLeaveSetting->refresh();

        expect($this->userLeaveSetting->current_balance)->toEqual(8.0);
        expect($this->userLeaveSetting->carried_over)->toEqual(8.0);

        // Should only have carry-over log, no forfeiture
        $logs = LeaveAccrualLog::where('user_leave_setting_id', $this->userLeaveSetting->id)->get();
        expect($logs)->toHaveCount(1);
        expect($logs->first()->type)->toBe(LeaveAccrualLog::TYPE_CARRY_OVER);
    });

    test('skips carry-over when not allowed', function () {
        $this->userLeaveSetting->update(['allow_carry_over' => false]);
        $yearEndDate = Carbon::createFromDate(2024, 12, 31);

        $this->accrualService->processYearEndCarryOver($this->userLeaveSetting, $yearEndDate);

        // No logs should be created
        $logs = LeaveAccrualLog::where('user_leave_setting_id', $this->userLeaveSetting->id)->get();
        expect($logs)->toHaveCount(0);
    });

    test('skips carry-over when balance is zero', function () {
        $this->userLeaveSetting->update(['current_balance' => 0]);
        $yearEndDate = Carbon::createFromDate(2024, 12, 31);

        $this->accrualService->processYearEndCarryOver($this->userLeaveSetting, $yearEndDate);

        // No logs should be created
        $logs = LeaveAccrualLog::where('user_leave_setting_id', $this->userLeaveSetting->id)->get();
        expect($logs)->toHaveCount(0);
    });
});

describe('processManualAdjustment', function () {
    test('processes positive adjustment within cap', function () {
        $this->userLeaveSetting->update(['current_balance' => 20.0]);

        $this->accrualService->processManualAdjustment(
            $this->userLeaveSetting,
            5.0,
            'Bonus leave credit',
            ['admin_id' => 1]
        );

        $this->userLeaveSetting->refresh();

        expect($this->userLeaveSetting->current_balance)->toEqual(25.0);

        $log = LeaveAccrualLog::first();
        expect($log->type)->toBe(LeaveAccrualLog::TYPE_ADJUSTMENT);
        expect($log->amount)->toEqual(5.0);
        expect($log->balance_before)->toEqual(20.0);
        expect($log->balance_after)->toEqual(25.0);
        expect($log->description)->toBe('Bonus leave credit');
    });

    test('processes negative adjustment', function () {
        $this->userLeaveSetting->update(['current_balance' => 20.0]);

        $this->accrualService->processManualAdjustment(
            $this->userLeaveSetting,
            -3.0,
            'Correction for error'
        );

        $this->userLeaveSetting->refresh();

        expect($this->userLeaveSetting->current_balance)->toEqual(17.0);

        $log = LeaveAccrualLog::first();
        expect($log->amount)->toEqual(-3.0);
        expect($log->balance_after)->toEqual(17.0);
    });

    test('caps adjustment at max_cap', function () {
        $this->userLeaveSetting->update(['current_balance' => 28.0]);

        $this->accrualService->processManualAdjustment(
            $this->userLeaveSetting,
            5.0,
            'Adjustment exceeding cap'
        );

        $this->userLeaveSetting->refresh();

        expect($this->userLeaveSetting->current_balance)->toEqual(30.0); // Max cap

        $log = LeaveAccrualLog::first();
        expect($log->amount)->toEqual(2.0); // Actual adjustment
        expect($log->metadata['requested_adjustment'])->toEqual(5.0);
        expect($log->metadata['capped'])->toBeTrue();
    });

    test('prevents negative balance', function () {
        $this->userLeaveSetting->update(['current_balance' => 5.0]);

        $this->accrualService->processManualAdjustment(
            $this->userLeaveSetting,
            -10.0,
            'Large deduction'
        );

        $this->userLeaveSetting->refresh();

        expect($this->userLeaveSetting->current_balance)->toEqual(0.0); // Minimum 0

        $log = LeaveAccrualLog::first();
        expect($log->amount)->toEqual(-5.0); // Actual adjustment
    });
});

describe('processLeaveDeduction', function () {
    test('processes valid leave deduction', function () {
        $this->userLeaveSetting->update(['current_balance' => 20.0]);
        $leaveDate = Carbon::today();

        $this->accrualService->processLeaveDeduction(
            $this->userLeaveSetting,
            3.5,
            $leaveDate,
            'Vacation leave request #123'
        );

        $this->userLeaveSetting->refresh();

        expect($this->userLeaveSetting->current_balance)->toEqual(16.5);

        $log = LeaveAccrualLog::first();
        expect($log->type)->toBe(LeaveAccrualLog::TYPE_DEDUCTION);
        expect($log->amount)->toEqual(-3.5);
        expect($log->balance_before)->toEqual(20.0);
        expect($log->balance_after)->toEqual(16.5);
        expect($log->accrual_date->toDateString())->toBe($leaveDate->toDateString());
    });

    test('throws exception for insufficient balance', function () {
        $this->userLeaveSetting->update(['current_balance' => 2.0]);

        expect(fn() => $this->accrualService->processLeaveDeduction(
            $this->userLeaveSetting,
            5.0,
            Carbon::today(),
            'Leave request'
        ))->toThrow(InvalidArgumentException::class, 'Insufficient leave balance');
    });

    test('throws exception for zero or negative deduction', function () {
        expect(fn() => $this->accrualService->processLeaveDeduction(
            $this->userLeaveSetting,
            0,
            Carbon::today(),
            'Invalid deduction'
        ))->toThrow(InvalidArgumentException::class, 'Deduction amount must be positive');

        expect(fn() => $this->accrualService->processLeaveDeduction(
            $this->userLeaveSetting,
            -1.0,
            Carbon::today(),
            'Invalid deduction'
        ))->toThrow(InvalidArgumentException::class, 'Deduction amount must be positive');
    });
});

describe('getAccrualSummary', function () {
    test('returns comprehensive summary', function () {
        $startDate = Carbon::today()->subMonths(3);
        $endDate   = Carbon::today();

        // Create various log types
        LeaveAccrualLog::create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
            'type'                  => LeaveAccrualLog::TYPE_ACCRUAL,
            'amount'                => 7.5,
            'balance_before'        => 10.0,
            'balance_after'         => 17.5,
            'description'           => 'Quarterly accrual',
            'accrual_date'          => $startDate->copy()->addMonth(),
            'processed_at'          => now(),
        ]);

        LeaveAccrualLog::create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
            'type'                  => LeaveAccrualLog::TYPE_DEDUCTION,
            'amount'                => -3.0,
            'balance_before'        => 17.5,
            'balance_after'         => 14.5,
            'description'           => 'Leave taken',
            'accrual_date'          => $startDate->copy()->addMonths(2),
            'processed_at'          => now(),
        ]);

        LeaveAccrualLog::create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
            'type'                  => LeaveAccrualLog::TYPE_ADJUSTMENT,
            'amount'                => 2.0,
            'balance_before'        => 14.5,
            'balance_after'         => 16.5,
            'description'           => 'Manual adjustment',
            'accrual_date'          => $endDate->copy()->subDays(5),
            'processed_at'          => now(),
        ]);

        $summary = $this->accrualService->getAccrualSummary($this->user->id, $startDate, $endDate);

        expect($summary['total_accrued'])->toEqual(7.5);
        expect($summary['total_deducted'])->toEqual(3.0);
        expect($summary['total_adjustments'])->toEqual(2.0);
        expect($summary['total_carry_over'])->toEqual(0.0);

        expect($summary['by_leave_type'])->toHaveKey('Vacation Leave');
        expect($summary['by_leave_type']['Vacation Leave']['accrued'])->toEqual(7.5);
        expect($summary['by_leave_type']['Vacation Leave']['deducted'])->toEqual(3.0);

        expect($summary['transactions'])->toHaveCount(3);
    });

    test('returns empty summary when no transactions', function () {
        $summary = $this->accrualService->getAccrualSummary(
            $this->user->id,
            Carbon::today()->subMonth(),
            Carbon::today()
        );

        expect($summary['total_accrued'])->toBe(0);
        expect($summary['total_deducted'])->toBe(0);
        expect($summary['by_leave_type'])->toBeEmpty();
        expect($summary['transactions'])->toBeEmpty();
    });
});
