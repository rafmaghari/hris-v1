<?php
namespace App\Services;

use App\Models\LeaveAccrualLog;
use App\Models\UserLeaveSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaveAccrualService
{
    /**
     * Process carry-over for user leave settings at year end
     */
    public function processYearEndCarryOver(UserLeaveSetting $setting, Carbon $yearEndDate): void
    {
        if (! $setting->allow_carry_over || $setting->current_balance <= 0) {
            return;
        }

        DB::transaction(function () use ($setting, $yearEndDate) {
            $currentBalance = $setting->current_balance;
            $maxCarryOver   = $setting->max_carry_over;

            // Calculate carry-over amount
            $carryOverAmount = min($currentBalance, $maxCarryOver);
            $forfeited       = $currentBalance - $carryOverAmount;

            // Update balances
            $setting->update([
                'current_balance' => $carryOverAmount,
                'carried_over'    => $carryOverAmount,
            ]);

            // Log carry-over
            LeaveAccrualLog::create([
                'user_leave_setting_id' => $setting->id,
                'user_id'               => $setting->user_id,
                'type'                  => LeaveAccrualLog::TYPE_CARRY_OVER,
                'amount'                => $carryOverAmount,
                'balance_before'        => $currentBalance,
                'balance_after'         => $carryOverAmount,
                'description'           => 'Year-end carry-over',
                'metadata'              => [
                    'year_end_date'  => $yearEndDate->toDateString(),
                    'max_carry_over' => $maxCarryOver,
                    'forfeited'      => $forfeited,
                ],
                'accrual_date'          => $yearEndDate,
                'processed_at'          => now(),
            ]);

            // Log forfeited amount if any
            if ($forfeited > 0) {
                LeaveAccrualLog::create([
                    'user_leave_setting_id' => $setting->id,
                    'user_id'               => $setting->user_id,
                    'type'                  => LeaveAccrualLog::TYPE_DEDUCTION,
                    'amount'                => -$forfeited,
                    'balance_before'        => $currentBalance,
                    'balance_after'         => $carryOverAmount,
                    'description'           => 'Year-end forfeiture (excess balance)',
                    'metadata'              => [
                        'year_end_date' => $yearEndDate->toDateString(),
                        'reason'        => 'exceeded_carry_over_limit',
                    ],
                    'accrual_date'          => $yearEndDate,
                    'processed_at'          => now(),
                ]);
            }

            Log::info('Leave carry-over processed', [
                'user_id'               => $setting->user_id,
                'user_leave_setting_id' => $setting->id,
                'carry_over_amount'     => $carryOverAmount,
                'forfeited_amount'      => $forfeited,
                'year_end_date'         => $yearEndDate->toDateString(),
            ]);
        });
    }

    /**
     * Process manual balance adjustment
     */
    public function processManualAdjustment(
        UserLeaveSetting $setting,
        float $adjustmentAmount,
        string $description,
        array $metadata = []
    ): void {
        DB::transaction(function () use ($setting, $adjustmentAmount, $description, $metadata) {
            $currentBalance   = $setting->current_balance;
            $newBalance       = max(0, min($currentBalance + $adjustmentAmount, $setting->max_cap));
            $actualAdjustment = $newBalance - $currentBalance;

            // Update balance
            $setting->update(['current_balance' => $newBalance]);

            // Create adjustment log
            LeaveAccrualLog::create([
                'user_leave_setting_id' => $setting->id,
                'user_id'               => $setting->user_id,
                'type'                  => LeaveAccrualLog::TYPE_ADJUSTMENT,
                'amount'                => $actualAdjustment,
                'balance_before'        => $currentBalance,
                'balance_after'         => $newBalance,
                'description'           => $description,
                'metadata'              => array_merge([
                    'requested_adjustment' => $adjustmentAmount,
                    'actual_adjustment'    => $actualAdjustment,
                    'capped'               => $actualAdjustment != $adjustmentAmount,
                ], $metadata),
                'accrual_date'          => Carbon::today(),
                'processed_at'          => now(),
            ]);

            Log::info('Manual leave adjustment processed', [
                'user_id'               => $setting->user_id,
                'user_leave_setting_id' => $setting->id,
                'adjustment_amount'     => $actualAdjustment,
                'balance_before'        => $currentBalance,
                'balance_after'         => $newBalance,
                'description'           => $description,
            ]);
        });
    }

    /**
     * Process leave deduction (when leave is taken)
     */
    public function processLeaveDeduction(
        UserLeaveSetting $setting,
        float $deductionAmount,
        Carbon $leaveDate,
        string $description = 'Leave taken',
        array $metadata = []
    ): void {
        if ($deductionAmount <= 0) {
            throw new \InvalidArgumentException('Deduction amount must be positive');
        }

        DB::transaction(function () use ($setting, $deductionAmount, $leaveDate, $description, $metadata) {
            $currentBalance = $setting->current_balance;

            if ($currentBalance < $deductionAmount) {
                throw new \InvalidArgumentException('Insufficient leave balance');
            }

            $newBalance = $currentBalance - $deductionAmount;

            // Update balance
            $setting->update(['current_balance' => $newBalance]);

            // Create deduction log
            LeaveAccrualLog::create([
                'user_leave_setting_id' => $setting->id,
                'user_id'               => $setting->user_id,
                'type'                  => LeaveAccrualLog::TYPE_DEDUCTION,
                'amount'                => -$deductionAmount,
                'balance_before'        => $currentBalance,
                'balance_after'         => $newBalance,
                'description'           => $description,
                'metadata'              => $metadata,
                'accrual_date'          => $leaveDate,
                'processed_at'          => now(),
            ]);

            Log::info('Leave deduction processed', [
                'user_id'               => $setting->user_id,
                'user_leave_setting_id' => $setting->id,
                'deduction_amount'      => $deductionAmount,
                'balance_before'        => $currentBalance,
                'balance_after'         => $newBalance,
                'leave_date'            => $leaveDate->toDateString(),
            ]);
        });
    }

    /**
     * Get accrual summary for a user in a given period
     */
    public function getAccrualSummary(int $userId, Carbon $startDate, Carbon $endDate): array
    {
        $logs = LeaveAccrualLog::forUser($userId)
            ->forPeriod($startDate, $endDate)
            ->with('userLeaveSetting.leaveSettingsTemplate.leaveType')
            ->get();

        $summary = [
            'total_accrued'     => 0,
            'total_deducted'    => 0,
            'total_adjustments' => 0,
            'total_carry_over'  => 0,
            'by_leave_type'     => [],
            'transactions'      => $logs->toArray(),
        ];

        foreach ($logs as $log) {
            $leaveTypeName = $log->userLeaveSetting->leaveSettingsTemplate->leaveType->name;

            if (! isset($summary['by_leave_type'][$leaveTypeName])) {
                $summary['by_leave_type'][$leaveTypeName] = [
                    'accrued'     => 0,
                    'deducted'    => 0,
                    'adjustments' => 0,
                    'carry_over'  => 0,
                ];
            }

            switch ($log->type) {
                case LeaveAccrualLog::TYPE_ACCRUAL:
                    $summary['total_accrued'] += $log->amount;
                    $summary['by_leave_type'][$leaveTypeName]['accrued'] += $log->amount;
                    break;

                case LeaveAccrualLog::TYPE_DEDUCTION:
                    $summary['total_deducted'] += abs($log->amount);
                    $summary['by_leave_type'][$leaveTypeName]['deducted'] += abs($log->amount);
                    break;

                case LeaveAccrualLog::TYPE_ADJUSTMENT:
                    $summary['total_adjustments'] += $log->amount;
                    $summary['by_leave_type'][$leaveTypeName]['adjustments'] += $log->amount;
                    break;

                case LeaveAccrualLog::TYPE_CARRY_OVER:
                    $summary['total_carry_over'] += $log->amount;
                    $summary['by_leave_type'][$leaveTypeName]['carry_over'] += $log->amount;
                    break;
            }
        }

        return $summary;
    }
}
