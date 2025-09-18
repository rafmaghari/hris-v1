<?php
namespace App\Console\Commands;

use App\Models\UserLeaveSetting;
use App\Services\LeaveAccrualService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessYearEndCarryOver extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leave:process-year-end-carry-over
                            {--year= : Year to process (default: current year)}
                            {--dry-run : Preview what would be processed without making changes}
                            {--user= : Process carry-over for specific user ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process year-end carry-over for user leave settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $year     = $this->option('year') ?: Carbon::now()->year;
        $isDryRun = $this->option('dry-run');
        $userId   = $this->option('user');

        $yearEndDate = Carbon::createFromDate($year, 12, 31);

        $this->info("Processing year-end carry-over for year: {$year}");
        $this->info("Year-end date: {$yearEndDate->toDateString()}");

        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Get all user leave settings that allow carry-over
        $query = UserLeaveSetting::with(['user', 'leaveSettingsTemplate.leaveType'])
            ->where('allow_carry_over', true)
            ->where('current_balance', '>', 0)
            ->where('start_date', '<=', $yearEndDate);

        if ($userId) {
            $query->where('user_id', $userId);
            $this->info("Processing for user ID: {$userId}");
        }

        $userLeaveSettings = $query->get();

        if ($userLeaveSettings->isEmpty()) {
            $this->info('No user leave settings found for carry-over processing.');
            return Command::SUCCESS;
        }

        $accrualService = new LeaveAccrualService();
        $processedCount = 0;
        $errorCount     = 0;

        $this->info("\nProcessing carry-overs:");

        foreach ($userLeaveSettings as $setting) {
            try {
                if (! $isDryRun) {
                    $accrualService->processYearEndCarryOver($setting, $yearEndDate);
                }

                $this->line("✓ Processed: User {$setting->user->name} - {$setting->leaveSettingsTemplate->name} (Balance: {$setting->current_balance}, Max Carry-over: {$setting->max_carry_over})");
                $processedCount++;

            } catch (\Exception $e) {
                $this->error("✗ Error processing User {$setting->user->name}: " . $e->getMessage());
                Log::error('Year-end carry-over processing error', [
                    'user_leave_setting_id' => $setting->id,
                    'user_id'               => $setting->user_id,
                    'year'                  => $year,
                    'error'                 => $e->getMessage(),
                    'trace'                 => $e->getTraceAsString(),
                ]);
                $errorCount++;
            }
        }

        $this->info("\nProcessing Summary:");
        $this->info("Processed: {$processedCount}");
        $this->info("Errors: {$errorCount}");

        return Command::SUCCESS;
    }
}
