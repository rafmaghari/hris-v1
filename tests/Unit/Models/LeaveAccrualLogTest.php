<?php

use App\Models\LeaveAccrualLog;
use App\Models\User;
use App\Models\UserLeaveSetting;
use Carbon\Carbon;

beforeEach(function () {
    $this->user             = User::factory()->create();
    $this->userLeaveSetting = UserLeaveSetting::factory()->create([
        'user_id' => $this->user->id,
    ]);
});

describe('model attributes and casting', function () {
    test('casts amount fields to decimal', function () {
        $log = LeaveAccrualLog::create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
            'type'                  => LeaveAccrualLog::TYPE_ACCRUAL,
            'amount'                => '10.5',
            'balance_before'        => '15.25',
            'balance_after'         => '25.75',
            'description'           => 'Test accrual',
            'accrual_date'          => Carbon::today(),
            'processed_at'          => now(),
        ]);

        expect($log->amount)->toBeString(); // Laravel casts decimals to strings
        expect($log->balance_before)->toBeString();
        expect($log->balance_after)->toBeString();
        expect($log->amount)->toEqual(10.5);
    });

    test('casts metadata to array', function () {
        $metadata = ['frequency' => 'monthly', 'cap_reached' => false];

        $log = LeaveAccrualLog::create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
            'type'                  => LeaveAccrualLog::TYPE_ACCRUAL,
            'amount'                => 5.0,
            'balance_before'        => 10.0,
            'balance_after'         => 15.0,
            'description'           => 'Test',
            'metadata'              => $metadata,
            'accrual_date'          => Carbon::today(),
            'processed_at'          => now(),
        ]);

        expect($log->metadata)->toBeArray();
        expect($log->metadata)->toBe($metadata);
    });

    test('casts dates correctly', function () {
        $accrualDate = Carbon::today();
        $processedAt = now();

        $log = LeaveAccrualLog::create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
            'type'                  => LeaveAccrualLog::TYPE_ACCRUAL,
            'amount'                => 5.0,
            'balance_before'        => 10.0,
            'balance_after'         => 15.0,
            'description'           => 'Test',
            'accrual_date'          => $accrualDate,
            'processed_at'          => $processedAt,
        ]);

        expect($log->accrual_date)->toBeInstanceOf(Carbon::class);
        expect($log->processed_at)->toBeInstanceOf(Carbon::class);
    });
});

describe('relationships', function () {
    test('belongs to user leave setting', function () {
        $log = LeaveAccrualLog::factory()->create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
        ]);

        expect($log->userLeaveSetting)->toBeInstanceOf(UserLeaveSetting::class);
        expect($log->userLeaveSetting->id)->toBe($this->userLeaveSetting->id);
    });

    test('belongs to user', function () {
        $log = LeaveAccrualLog::factory()->create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
        ]);

        expect($log->user)->toBeInstanceOf(User::class);
        expect($log->user->id)->toBe($this->user->id);
    });
});

describe('scopes', function () {
    beforeEach(function () {
        $this->otherUser             = User::factory()->create();
        $this->otherUserLeaveSetting = UserLeaveSetting::factory()->create([
            'user_id' => $this->otherUser->id,
        ]);

        // Create logs for main user
        LeaveAccrualLog::factory()->create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
            'type'                  => LeaveAccrualLog::TYPE_ACCRUAL,
            'accrual_date'          => Carbon::today()->subDays(10),
        ]);

        LeaveAccrualLog::factory()->create([
            'user_leave_setting_id' => $this->userLeaveSetting->id,
            'user_id'               => $this->user->id,
            'type'                  => LeaveAccrualLog::TYPE_DEDUCTION,
            'accrual_date'          => Carbon::today()->subDays(5),
        ]);

        // Create log for other user
        LeaveAccrualLog::factory()->create([
            'user_leave_setting_id' => $this->otherUserLeaveSetting->id,
            'user_id'               => $this->otherUser->id,
            'type'                  => LeaveAccrualLog::TYPE_ACCRUAL,
            'accrual_date'          => Carbon::today()->subDays(8),
        ]);
    });

    test('forUser scope filters by user', function () {
        $logs = LeaveAccrualLog::forUser($this->user->id)->get();

        expect($logs)->toHaveCount(2);
        expect($logs->pluck('user_id')->unique()->values()->toArray())->toEqual([$this->user->id]);
    });

    test('byType scope filters by transaction type', function () {
        $accrualLogs   = LeaveAccrualLog::byType(LeaveAccrualLog::TYPE_ACCRUAL)->get();
        $deductionLogs = LeaveAccrualLog::byType(LeaveAccrualLog::TYPE_DEDUCTION)->get();

        expect($accrualLogs)->toHaveCount(2);   // Both users have accrual logs
        expect($deductionLogs)->toHaveCount(1); // Only main user has deduction log

        expect($accrualLogs->pluck('type')->unique()->values()->toArray())->toEqual([LeaveAccrualLog::TYPE_ACCRUAL]);
        expect($deductionLogs->pluck('type')->unique()->values()->toArray())->toEqual([LeaveAccrualLog::TYPE_DEDUCTION]);
    });

    test('forPeriod scope filters by date range', function () {
        $startDate = Carbon::today()->subDays(7);
        $endDate   = Carbon::today()->subDays(3);

        $logs = LeaveAccrualLog::forPeriod($startDate, $endDate)->get();

        expect($logs)->toHaveCount(1); // Only the deduction log at -5 days falls in range
        expect($logs->first()->accrual_date->between($startDate, $endDate))->toBeTrue();
    });

    test('combined scopes work together', function () {
        $logs = LeaveAccrualLog::forUser($this->user->id)
            ->byType(LeaveAccrualLog::TYPE_ACCRUAL)
            ->get();

        expect($logs)->toHaveCount(1);
        expect($logs->first()->user_id)->toBe($this->user->id);
        expect($logs->first()->type)->toBe(LeaveAccrualLog::TYPE_ACCRUAL);
    });
});

describe('constants', function () {
    test('defines transaction type constants', function () {
        expect(LeaveAccrualLog::TYPE_ACCRUAL)->toBe('accrual');
        expect(LeaveAccrualLog::TYPE_DEDUCTION)->toBe('deduction');
        expect(LeaveAccrualLog::TYPE_CARRY_OVER)->toBe('carry_over');
        expect(LeaveAccrualLog::TYPE_ADJUSTMENT)->toBe('adjustment');
    });
});
