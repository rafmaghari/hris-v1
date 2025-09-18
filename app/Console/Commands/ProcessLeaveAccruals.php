<?php
namespace App\Console\Commands;

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use App\Models\LeaveAccrualLog;
use App\Models\UserLeaveSetting;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessLeaveAccruals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leave:process-accruals
                            {--date= : Process accruals for specific date (Y-m-d format)}
                            {--dry-run : Preview what would be processed without making changes}
                            {--user= : Process accruals for specific user ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process leave accruals based on user leave settings and frequencies (includes per-minute option for testing)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $processDate = $this->option('date') ? Carbon::parse($this->option('date')) : Carbon::now();
        $isDryRun    = $this->option('dry-run');
        $userId      = $this->option('user');

        $this->info("Processing leave accruals for date: {$processDate->toDateTimeString()}");

        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Get all active user leave settings that need accrual processing
        $query = UserLeaveSetting::with(['user', 'leaveSettingsTemplate.leaveType'])
            ->where('accrual_type', LeadAccrualType::ACCRUAL)
            ->where('start_date', '<=', $processDate)
            ->where(function ($q) use ($processDate) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', $processDate);
            });

        if ($userId) {
            $query->where('user_id', $userId);
            $this->info("Processing for user ID: {$userId}");
        }

        $userLeaveSettings = $query->get();

        if ($userLeaveSettings->isEmpty()) {
            $this->info('No user leave settings found for processing.');
            return Command::SUCCESS;
        }

        $processedCount = 0;
        $skippedCount   = 0;
        $errorCount     = 0;

        foreach ($userLeaveSettings as $setting) {
            try {
                if ($this->shouldProcessAccrual($setting, $processDate)) {
                    if (! $isDryRun) {
                        $this->processAccrual($setting, $processDate);
                    }

                    $this->line("✓ Processed: User {$setting->user->name} - {$setting->leaveSettingsTemplate->name}");
                    $processedCount++;
                } else {
                    $this->line("- Skipped: User {$setting->user->name} - {$setting->leaveSettingsTemplate->name} (not due for accrual)");
                    $skippedCount++;
                }
            } catch (\Exception $e) {
                $this->error("✗ Error processing User {$setting->user->name}: " . $e->getMessage());
                Log::error('Leave accrual processing error', [
                    'user_leave_setting_id' => $setting->id,
                    'user_id'               => $setting->user_id,
                    'error'                 => $e->getMessage(),
                    'trace'                 => $e->getTraceAsString(),
                ]);
                $errorCount++;
            }
        }

        $this->info("\nProcessing Summary:");
        $this->info("Processed: {$processedCount}");
        $this->info("Skipped: {$skippedCount}");
        $this->info("Errors: {$errorCount}");

        return Command::SUCCESS;
    }

    /**
     * Check if accrual should be processed for the given date
     */
    private function shouldProcessAccrual(UserLeaveSetting $setting, Carbon $processDate): bool
    {
        // Check if we already processed accrual for this period
        $lastAccrual = LeaveAccrualLog::where('user_leave_setting_id', $setting->id)
            ->where('type', LeaveAccrualLog::TYPE_ACCRUAL)
            ->orderBy('accrual_date', 'desc')
            ->first();

        $frequency = $setting->accrual_frequency;

        // If no previous accrual, check if we should start from start_date
        if (! $lastAccrual) {
            return $this->isAccrualDueFromStartDate($setting, $processDate);
        }

        // Check if enough time has passed based on frequency
        return $this->isAccrualDueFromLastAccrual($lastAccrual->accrual_date, $processDate, $frequency);
    }

    /**
     * Check if accrual is due from start date
     */
    private function isAccrualDueFromStartDate(UserLeaveSetting $setting, Carbon $processDate): bool
    {
        $startDate = Carbon::parse($setting->start_date);
        $frequency = $setting->accrual_frequency;

        switch ($frequency) {
            case LeadAccrualFrequencyType::PER_MINUTE:
                return $processDate->greaterThan($startDate->copy()->addMinute());

            case LeadAccrualFrequencyType::MONTHLY:
                return $processDate->greaterThanOrEqualTo($startDate->copy()->addMonth());

            case LeadAccrualFrequencyType::BIMONTHLY:
                return $processDate->greaterThanOrEqualTo($startDate->copy()->addMonths(2));

            case LeadAccrualFrequencyType::QUARTERLY:
                return $processDate->greaterThanOrEqualTo($startDate->copy()->addMonths(3));

            case LeadAccrualFrequencyType::YEARLY:
                return $processDate->greaterThanOrEqualTo($startDate->copy()->addYear());

            default:
                return false;
        }
    }

    /**
     * Check if accrual is due from last accrual date
     */
    private function isAccrualDueFromLastAccrual(Carbon $lastAccrualDate, Carbon $processDate, LeadAccrualFrequencyType $frequency): bool
    {
        switch ($frequency) {
            case LeadAccrualFrequencyType::PER_MINUTE:
                return $processDate->greaterThan($lastAccrualDate->copy()->addMinute());

            case LeadAccrualFrequencyType::MONTHLY:
                return $processDate->greaterThanOrEqualTo($lastAccrualDate->copy()->addMonth());

            case LeadAccrualFrequencyType::BIMONTHLY:
                return $processDate->greaterThanOrEqualTo($lastAccrualDate->copy()->addMonths(2));

            case LeadAccrualFrequencyType::QUARTERLY:
                return $processDate->greaterThanOrEqualTo($lastAccrualDate->copy()->addMonths(3));

            case LeadAccrualFrequencyType::YEARLY:
                return $processDate->greaterThanOrEqualTo($lastAccrualDate->copy()->addYear());

            default:
                return false;
        }
    }

    /**
     * Process the accrual for a user leave setting
     */
    private function processAccrual(UserLeaveSetting $setting, Carbon $processDate): void
    {
        DB::transaction(function () use ($setting, $processDate) {
            $accrualAmount  = $setting->accrual_amount;
            $currentBalance = $setting->current_balance;
            $maxCap         = $setting->max_cap;

            // Calculate new balance, respecting max cap
            $newBalance          = min($currentBalance + $accrualAmount, $maxCap);
            $actualAccrualAmount = $newBalance - $currentBalance;

            // Update the user leave setting balance
            $setting->update(['current_balance' => $newBalance]);

            // Create accrual log
            LeaveAccrualLog::create([
                'user_leave_setting_id' => $setting->id,
                'user_id'               => $setting->user_id,
                'type'                  => LeaveAccrualLog::TYPE_ACCRUAL,
                'amount'                => $actualAccrualAmount,
                'balance_before'        => $currentBalance,
                'balance_after'         => $newBalance,
                'description'           => $this->getAccrualDescription($setting->accrual_frequency),
                'metadata'              => [
                    'accrual_frequency' => $setting->accrual_frequency->value,
                    'scheduled_amount'  => $accrualAmount,
                    'actual_amount'     => $actualAccrualAmount,
                    'max_cap'           => $maxCap,
                    'capped'            => $actualAccrualAmount < $accrualAmount,
                ],
                'accrual_date'          => $processDate,
                'processed_at'          => now(),
            ]);

            Log::info('Leave accrual processed', [
                'user_id'               => $setting->user_id,
                'user_leave_setting_id' => $setting->id,
                'amount'                => $actualAccrualAmount,
                'balance_before'        => $currentBalance,
                'balance_after'         => $newBalance,
                'accrual_date'          => $processDate->toDateString(),
            ]);
        });
    }

    /**
     * Get description for accrual based on frequency
     */
    private function getAccrualDescription(LeadAccrualFrequencyType $frequency): string
    {
        return match ($frequency) {
            LeadAccrualFrequencyType::PER_MINUTE => 'Per-minute accrual (testing)',
            LeadAccrualFrequencyType::MONTHLY    => 'Monthly accrual',
            LeadAccrualFrequencyType::BIMONTHLY  => 'Bi-monthly accrual',
            LeadAccrualFrequencyType::QUARTERLY  => 'Quarterly accrual',
            LeadAccrualFrequencyType::YEARLY     => 'Yearly accrual',
        };
    }
}
