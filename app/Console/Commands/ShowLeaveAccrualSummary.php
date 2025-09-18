<?php
namespace App\Console\Commands;

use App\Services\LeaveAccrualService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ShowLeaveAccrualSummary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leave:show-accrual-summary
                            {user : User ID to show summary for}
                            {--start-date= : Start date (Y-m-d format, default: start of current year)}
                            {--end-date= : End date (Y-m-d format, default: today)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show leave accrual summary for a specific user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId    = $this->argument('user');
        $startDate = $this->option('start-date')
            ? Carbon::parse($this->option('start-date'))
            : Carbon::now()->startOfYear();
        $endDate = $this->option('end-date')
            ? Carbon::parse($this->option('end-date'))
            : Carbon::today();

        $this->info("Leave Accrual Summary for User ID: {$userId}");
        $this->info("Period: {$startDate->toDateString()} to {$endDate->toDateString()}");
        $this->info(str_repeat('=', 60));

        $accrualService = new LeaveAccrualService();
        $summary        = $accrualService->getAccrualSummary($userId, $startDate, $endDate);

        // Overall summary
        $this->table([
            'Metric',
            'Amount',
        ], [
            ['Total Accrued', number_format($summary['total_accrued'], 2)],
            ['Total Deducted', number_format($summary['total_deducted'], 2)],
            ['Total Adjustments', number_format($summary['total_adjustments'], 2)],
            ['Total Carry-over', number_format($summary['total_carry_over'], 2)],
        ]);

        // By leave type
        if (! empty($summary['by_leave_type'])) {
            $this->info("\nBreakdown by Leave Type:");
            $rows = [];
            foreach ($summary['by_leave_type'] as $leaveType => $data) {
                $rows[] = [
                    $leaveType,
                    number_format($data['accrued'], 2),
                    number_format($data['deducted'], 2),
                    number_format($data['adjustments'], 2),
                    number_format($data['carry_over'], 2),
                ];
            }

            $this->table([
                'Leave Type',
                'Accrued',
                'Deducted',
                'Adjustments',
                'Carry-over',
            ], $rows);
        }

        // Recent transactions
        if (! empty($summary['transactions'])) {
            $this->info("\nRecent Transactions:");
            $recentTransactions = array_slice(array_reverse($summary['transactions']), 0, 10);
            $rows               = [];

            foreach ($recentTransactions as $transaction) {
                $rows[] = [
                    $transaction['accrual_date'],
                    ucfirst($transaction['type']),
                    $transaction['description'],
                    number_format($transaction['amount'], 2),
                    number_format($transaction['balance_after'], 2),
                ];
            }

            $this->table([
                'Date',
                'Type',
                'Description',
                'Amount',
                'Balance After',
            ], $rows);
        } else {
            $this->info("\nNo transactions found for the specified period.");
        }

        return Command::SUCCESS;
    }
}
