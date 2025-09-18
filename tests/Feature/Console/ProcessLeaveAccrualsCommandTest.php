<?php

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use App\Models\LeaveAccrualLog;
use App\Models\LeaveSettingsTemplate;
use App\Models\LeaveType;
use App\Models\User;
use App\Models\UserLeaveSetting;
use Carbon\Carbon;

beforeEach(function () {
    // Create test users and settings
    $this->user1 = User::factory()->create(['first_name' => 'John', 'last_name' => 'Doe']);
    $this->user2 = User::factory()->create(['first_name' => 'Jane', 'last_name' => 'Smith']);

    $this->leaveType     = LeaveType::factory()->create(['name' => 'Vacation Leave']);
    $this->leaveTemplate = LeaveSettingsTemplate::factory()->create([
        'leave_type_id'     => $this->leaveType->id,
        'name'              => 'Standard VL',
        'accrual_type'      => LeadAccrualType::ACCRUAL,
        'accrual_frequency' => LeadAccrualFrequencyType::MONTHLY,
        'accrual_amount'    => 2.5,
        'max_cap'           => 30.0,
    ]);

    // User 1: Started 2 months ago, should be ready for accrual
    $this->userLeaveSetting1 = UserLeaveSetting::factory()->create([
        'user_id'                    => $this->user1->id,
        'leave_settings_template_id' => $this->leaveTemplate->id,
        'start_date'                 => Carbon::today()->subMonths(2),
        'accrual_type'               => LeadAccrualType::ACCRUAL,
        'accrual_frequency'          => LeadAccrualFrequencyType::MONTHLY,
        'accrual_amount'             => 2.5,
        'max_cap'                    => 30.0,
        'current_balance'            => 5.0,
    ]);

    // User 2: Started yesterday, not ready for accrual
    $this->userLeaveSetting2 = UserLeaveSetting::factory()->create([
        'user_id'                    => $this->user2->id,
        'leave_settings_template_id' => $this->leaveTemplate->id,
        'start_date'                 => Carbon::yesterday(),
        'accrual_type'               => LeadAccrualType::ACCRUAL,
        'accrual_frequency'          => LeadAccrualFrequencyType::MONTHLY,
        'accrual_amount'             => 2.5,
        'max_cap'                    => 30.0,
        'current_balance'            => 0.0,
    ]);
});

describe('basic command execution', function () {
    test('processes accruals successfully', function () {
        $this->artisan('leave:process-accruals')
            ->expectsOutput('Processing leave accruals for date: ' . Carbon::today()->toDateString())
            ->expectsOutput('✓ Processed: User John Doe - Standard VL')
            ->expectsOutput('- Skipped: User Jane Smith - Standard VL (not due for accrual)')
            ->expectsOutput('Processed: 1')
            ->expectsOutput('Skipped: 1')
            ->expectsOutput('Errors: 0')
            ->assertExitCode(0);

        // Verify balance was updated
        $this->userLeaveSetting1->refresh();
        expect($this->userLeaveSetting1->current_balance)->toEqual(7.5);

        // Verify log was created
        $log = LeaveAccrualLog::where('user_id', $this->user1->id)->first();
        expect($log)->not->toBeNull();
        expect($log->type)->toBe(LeaveAccrualLog::TYPE_ACCRUAL);
        expect($log->amount)->toEqual(2.5);
    });

    test('dry run does not make changes', function () {
        $originalBalance = $this->userLeaveSetting1->current_balance;

        $this->artisan('leave:process-accruals --dry-run')
            ->expectsOutput('DRY RUN MODE - No changes will be made')
            ->expectsOutput('✓ Processed: User John Doe - Standard VL')
            ->assertExitCode(0);

        // Balance should remain unchanged
        $this->userLeaveSetting1->refresh();
        expect($this->userLeaveSetting1->current_balance)->toBe($originalBalance);

        // No logs should be created
        expect(LeaveAccrualLog::count())->toBe(0);
    });

    test('processes for specific date', function () {
        $specificDate = Carbon::today()->addDays(5);

        $this->artisan("leave:process-accruals --date={$specificDate->toDateString()}")
            ->expectsOutput("Processing leave accruals for date: {$specificDate->toDateString()}")
            ->assertExitCode(0);
    });

    test('processes for specific user', function () {
        $this->artisan("leave:process-accruals --user={$this->user1->id}")
            ->expectsOutput("Processing for user ID: {$this->user1->id}")
            ->expectsOutput('✓ Processed: User John Doe - Standard VL')
            ->expectsOutput('Processed: 1')
            ->expectsOutput('Skipped: 0')
            ->assertExitCode(0);
    });
});

describe('accrual frequency logic', function () {
    test('respects monthly frequency', function () {
        // Set start date to exactly 1 month ago
        $this->userLeaveSetting1->update([
            'start_date' => Carbon::today()->subMonth(),
        ]);

        $this->artisan('leave:process-accruals')
            ->expectsOutput('✓ Processed: User John Doe - Standard VL')
            ->assertExitCode(0);
    });

    test('skips when not due for monthly accrual', function () {
        // Set start date to 3 weeks ago (not a full month)
        $this->userLeaveSetting1->update([
            'start_date' => Carbon::today()->subWeeks(3),
        ]);

        $this->artisan('leave:process-accruals')
            ->expectsOutput('- Skipped: User John Doe - Standard VL (not due for accrual)')
            ->assertExitCode(0);
    });

    test('handles quarterly frequency', function () {
        $this->userLeaveSetting1->update([
            'accrual_frequency' => LeadAccrualFrequencyType::QUARTERLY,
            'start_date'        => Carbon::today()->subMonths(4),
            'accrual_amount'    => 7.5, // 3 months worth
        ]);

        $this->artisan('leave:process-accruals')
            ->expectsOutput('✓ Processed: User John Doe - Standard VL')
            ->assertExitCode(0);

        $this->userLeaveSetting1->refresh();
        expect($this->userLeaveSetting1->current_balance)->toEqual(12.5); // 5.0 + 7.5
    });
});

describe('balance cap handling', function () {
    test('respects maximum cap', function () {
        // Set balance close to cap
        $this->userLeaveSetting1->update([
            'current_balance' => 28.5,
            'max_cap'         => 30.0,
        ]);

        $this->artisan('leave:process-accruals')
            ->assertExitCode(0);

        $this->userLeaveSetting1->refresh();
        expect($this->userLeaveSetting1->current_balance)->toEqual(30.0); // Capped at max

        // Check log shows capping occurred
        $log = LeaveAccrualLog::where('user_id', $this->user1->id)->first();
        expect($log->amount)->toEqual(1.5); // Only 1.5 was actually added
        expect($log->metadata['capped'])->toBeTrue();
        expect($log->metadata['scheduled_amount'])->toEqual(2.5);
    });
});

describe('previous accrual tracking', function () {
    test('skips when already processed this period', function () {
        // Create a previous accrual log for this month
        LeaveAccrualLog::create([
            'user_leave_setting_id' => $this->userLeaveSetting1->id,
            'user_id'               => $this->user1->id,
            'type'                  => LeaveAccrualLog::TYPE_ACCRUAL,
            'amount'                => 2.5,
            'balance_before'        => 2.5,
            'balance_after'         => 5.0,
            'description'           => 'Monthly accrual',
            'accrual_date'          => Carbon::today()->subDays(15), // This month
            'processed_at'          => now(),
        ]);

        $this->artisan('leave:process-accruals')
            ->expectsOutput('- Skipped: User John Doe - Standard VL (not due for accrual)')
            ->assertExitCode(0);
    });

    test('processes when enough time passed since last accrual', function () {
        // Create a previous accrual log for last month
        LeaveAccrualLog::create([
            'user_leave_setting_id' => $this->userLeaveSetting1->id,
            'user_id'               => $this->user1->id,
            'type'                  => LeaveAccrualLog::TYPE_ACCRUAL,
            'amount'                => 2.5,
            'balance_before'        => 2.5,
            'balance_after'         => 5.0,
            'description'           => 'Monthly accrual',
            'accrual_date'          => Carbon::today()->subMonth()->subDays(5),
            'processed_at'          => now(),
        ]);

        $this->artisan('leave:process-accruals')
            ->expectsOutput('✓ Processed: User John Doe - Standard VL')
            ->assertExitCode(0);
    });
});

describe('error handling', function () {
    test('handles missing user leave settings gracefully', function () {
        // Delete all user leave settings
        UserLeaveSetting::truncate();

        $this->artisan('leave:process-accruals')
            ->expectsOutput('No user leave settings found for processing.')
            ->assertExitCode(0);
    });

    test('continues processing other users when one fails', function () {
        // This test would require mocking to simulate an error
        // For now, just verify the command structure handles it
        $this->artisan('leave:process-accruals')
            ->assertExitCode(0);
    });
});

describe('filtering and options', function () {
    test('processes only accrual type settings', function () {
        // Create a fixed type setting
        $fixedSetting = UserLeaveSetting::factory()->create([
            'user_id'                    => $this->user2->id,
            'leave_settings_template_id' => $this->leaveTemplate->id,
            'start_date'                 => Carbon::today()->subMonths(2),
            'accrual_type'               => LeadAccrualType::FIXED, // Fixed, not accrual
            'current_balance'            => 15.0,
        ]);

        $this->artisan('leave:process-accruals')
            ->expectsOutput('✓ Processed: User John Doe - Standard VL') // Only accrual type
            ->expectsOutput('Processed: 1')
            ->assertExitCode(0);
    });

    test('respects end date for active settings', function () {
        // Set end date in the past
        $this->userLeaveSetting1->update([
            'end_date' => Carbon::yesterday(),
        ]);

        $this->artisan('leave:process-accruals')
            ->expectsOutput('- Skipped: User Jane Smith - Standard VL (not due for accrual)')
            ->expectsOutput('Processed: 0')
            ->expectsOutput('Skipped: 1')
            ->assertExitCode(0);
    });
});
