<?php

use App\Models\LeaveAccrualLog;
use App\Models\LeaveSettingsTemplate;
use App\Models\LeaveType;
use App\Models\User;
use App\Models\UserLeaveSetting;
use Carbon\Carbon;

beforeEach(function () {
    $this->user1 = User::factory()->create(['first_name' => 'John', 'last_name' => 'Doe']);
    $this->user2 = User::factory()->create(['first_name' => 'Jane', 'last_name' => 'Smith']);

    $this->leaveType     = LeaveType::factory()->create(['name' => 'Vacation Leave']);
    $this->leaveTemplate = LeaveSettingsTemplate::factory()->create([
        'leave_type_id' => $this->leaveType->id,
        'name'          => 'Standard VL',
    ]);

    // User with carry-over allowed and balance > 0
    $this->userLeaveSetting1 = UserLeaveSetting::factory()->create([
        'user_id'                    => $this->user1->id,
        'leave_settings_template_id' => $this->leaveTemplate->id,
        'start_date'                 => Carbon::createFromDate(2024, 1, 1),
        'allow_carry_over'           => true,
        'max_carry_over'             => 10.0,
        'current_balance'            => 15.0,
        'carried_over'               => 0.0,
    ]);

    // User with carry-over not allowed
    $this->userLeaveSetting2 = UserLeaveSetting::factory()->create([
        'user_id'                    => $this->user2->id,
        'leave_settings_template_id' => $this->leaveTemplate->id,
        'start_date'                 => Carbon::createFromDate(2024, 1, 1),
        'allow_carry_over'           => false,
        'max_carry_over'             => 0.0,
        'current_balance'            => 8.0,
        'carried_over'               => 0.0,
    ]);
});

describe('basic command execution', function () {
    test('processes carry-over successfully', function () {
        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->expectsOutput('Processing year-end carry-over for year: 2024')
            ->expectsOutput('Year-end date: 2024-12-31')
            ->expectsOutput('✓ Processed: User John Doe - Standard VL (Balance: 15.00, Max Carry-over: 10.00)')
            ->expectsOutput('Processed: 1')
            ->expectsOutput('Errors: 0')
            ->assertExitCode(0);

        // Verify balance was updated
        $this->userLeaveSetting1->refresh();
        expect($this->userLeaveSetting1->current_balance)->toBe(10.0);
        expect($this->userLeaveSetting1->carried_over)->toBe(10.0);

        // Verify logs were created
        $carryOverLog = LeaveAccrualLog::where('type', LeaveAccrualLog::TYPE_CARRY_OVER)->first();
        expect($carryOverLog)->not->toBeNull();
        expect($carryOverLog->amount)->toBe(10.0);

        $forfeitureLog = LeaveAccrualLog::where('type', LeaveAccrualLog::TYPE_DEDUCTION)->first();
        expect($forfeitureLog)->not->toBeNull();
        expect($forfeitureLog->amount)->toBe(-5.0);
    });

    test('uses current year by default', function () {
        $currentYear = Carbon::now()->year;

        $this->artisan('leave:process-year-end-carry-over')
            ->expectsOutput("Processing year-end carry-over for year: {$currentYear}")
            ->assertExitCode(0);
    });

    test('dry run does not make changes', function () {
        $originalBalance     = $this->userLeaveSetting1->current_balance;
        $originalCarriedOver = $this->userLeaveSetting1->carried_over;

        $this->artisan('leave:process-year-end-carry-over --dry-run --year=2024')
            ->expectsOutput('DRY RUN MODE - No changes will be made')
            ->expectsOutput('✓ Processed: User John Doe - Standard VL (Balance: 15.00, Max Carry-over: 10.00)')
            ->assertExitCode(0);

        // Balance should remain unchanged
        $this->userLeaveSetting1->refresh();
        expect($this->userLeaveSetting1->current_balance)->toBe($originalBalance);
        expect($this->userLeaveSetting1->carried_over)->toBe($originalCarriedOver);

        // No logs should be created
        expect(LeaveAccrualLog::count())->toBe(0);
    });

    test('processes for specific user', function () {
        $this->artisan("leave:process-year-end-carry-over --user={$this->user1->id} --year=2024")
            ->expectsOutput("Processing for user ID: {$this->user1->id}")
            ->expectsOutput('✓ Processed: User John Doe - Standard VL (Balance: 15.00, Max Carry-over: 10.00)')
            ->expectsOutput('Processed: 1')
            ->assertExitCode(0);
    });
});

describe('carry-over logic', function () {
    test('carries over full balance when within limit', function () {
        $this->userLeaveSetting1->update([
            'current_balance' => 8.0,
            'max_carry_over'  => 10.0,
        ]);

        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->assertExitCode(0);

        $this->userLeaveSetting1->refresh();
        expect($this->userLeaveSetting1->current_balance)->toBe(8.0);
        expect($this->userLeaveSetting1->carried_over)->toBe(8.0);

        // Should only have carry-over log, no forfeiture
        $logs = LeaveAccrualLog::where('user_leave_setting_id', $this->userLeaveSetting1->id)->get();
        expect($logs)->toHaveCount(1);
        expect($logs->first()->type)->toBe(LeaveAccrualLog::TYPE_CARRY_OVER);
    });

    test('caps carry-over and creates forfeiture log', function () {
        $this->userLeaveSetting1->update([
            'current_balance' => 20.0,
            'max_carry_over'  => 12.0,
        ]);

        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->assertExitCode(0);

        $this->userLeaveSetting1->refresh();
        expect($this->userLeaveSetting1->current_balance)->toBe(12.0);
        expect($this->userLeaveSetting1->carried_over)->toBe(12.0);

        // Should have both carry-over and forfeiture logs
        $logs = LeaveAccrualLog::where('user_leave_setting_id', $this->userLeaveSetting1->id)->get();
        expect($logs)->toHaveCount(2);

        $carryOverLog = $logs->where('type', LeaveAccrualLog::TYPE_CARRY_OVER)->first();
        expect($carryOverLog->amount)->toBe(12.0);
        expect($carryOverLog->metadata['forfeited'])->toBe(8.0);

        $forfeitureLog = $logs->where('type', LeaveAccrualLog::TYPE_DEDUCTION)->first();
        expect($forfeitureLog->amount)->toBe(-8.0);
        expect($forfeitureLog->description)->toContain('forfeiture');
    });

    test('skips when carry-over not allowed', function () {
        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->expectsOutput('No user leave settings found for carry-over processing.')
            ->assertExitCode(0);

        // No changes should be made to user2
        $this->userLeaveSetting2->refresh();
        expect($this->userLeaveSetting2->current_balance)->toBe(8.0);
        expect($this->userLeaveSetting2->carried_over)->toBe(0.0);
    });

    test('skips when balance is zero', function () {
        $this->userLeaveSetting1->update(['current_balance' => 0.0]);

        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->expectsOutput('No user leave settings found for carry-over processing.')
            ->assertExitCode(0);
    });
});

describe('filtering criteria', function () {
    test('only processes settings that allow carry-over', function () {
        // Create another user with carry-over allowed but zero balance
        $user3             = User::factory()->create(['name' => 'Bob Wilson']);
        $userLeaveSetting3 = UserLeaveSetting::factory()->create([
            'user_id'                    => $user3->id,
            'leave_settings_template_id' => $this->leaveTemplate->id,
            'start_date'                 => Carbon::createFromDate(2024, 1, 1),
            'allow_carry_over'           => true,
            'max_carry_over'             => 5.0,
            'current_balance'            => 0.0,
        ]);

        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->expectsOutput('✓ Processed: User John Doe - Standard VL (Balance: 15.00, Max Carry-over: 10.00)')
            ->expectsOutput('Processed: 1')
            ->assertExitCode(0);
    });

    test('only processes settings with positive balance', function () {
        $this->userLeaveSetting1->update(['current_balance' => 0.0]);

        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->expectsOutput('No user leave settings found for carry-over processing.')
            ->assertExitCode(0);
    });

    test('respects start date filter', function () {
        // Set start date after year end
        $this->userLeaveSetting1->update([
            'start_date' => Carbon::createFromDate(2025, 1, 1),
        ]);

        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->expectsOutput('No user leave settings found for carry-over processing.')
            ->assertExitCode(0);
    });
});

describe('metadata and logging', function () {
    test('creates detailed metadata in logs', function () {
        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->assertExitCode(0);

        $carryOverLog = LeaveAccrualLog::where('type', LeaveAccrualLog::TYPE_CARRY_OVER)->first();

        expect($carryOverLog->metadata)->toHaveKey('year_end_date');
        expect($carryOverLog->metadata)->toHaveKey('max_carry_over');
        expect($carryOverLog->metadata)->toHaveKey('forfeited');
        expect($carryOverLog->metadata['year_end_date'])->toBe('2024-12-31');
        expect($carryOverLog->metadata['max_carry_over'])->toBe(10.0);
        expect($carryOverLog->metadata['forfeited'])->toBe(5.0);
    });

    test('sets correct accrual date', function () {
        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->assertExitCode(0);

        $log = LeaveAccrualLog::first();
        expect($log->accrual_date->toDateString())->toBe('2024-12-31');
    });
});

describe('error handling', function () {
    test('handles no eligible settings gracefully', function () {
        // Make all settings ineligible
        UserLeaveSetting::query()->update([
            'allow_carry_over' => false,
            'current_balance'  => 0.0,
        ]);

        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->expectsOutput('No user leave settings found for carry-over processing.')
            ->assertExitCode(0);
    });

    test('continues processing when individual user fails', function () {
        // This would require mocking to simulate database errors
        // For now, verify the command structure
        $this->artisan('leave:process-year-end-carry-over --year=2024')
            ->assertExitCode(0);
    });
});

describe('year parameter validation', function () {
    test('handles different year formats', function () {
        $this->artisan('leave:process-year-end-carry-over --year=2023')
            ->expectsOutput('Processing year-end carry-over for year: 2023')
            ->expectsOutput('Year-end date: 2023-12-31')
            ->assertExitCode(0);
    });
});
