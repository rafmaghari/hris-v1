<?php
namespace Database\Factories;

use App\Models\LeaveAccrualLog;
use App\Models\User;
use App\Models\UserLeaveSetting;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaveAccrualLog>
 */
class LeaveAccrualLogFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = LeaveAccrualLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement([
            LeaveAccrualLog::TYPE_ACCRUAL,
            LeaveAccrualLog::TYPE_DEDUCTION,
            LeaveAccrualLog::TYPE_ADJUSTMENT,
            LeaveAccrualLog::TYPE_CARRY_OVER,
        ]);

        $balanceBefore = $this->faker->randomFloat(2, 0, 30);
        $amount        = $this->getAmountForType($type);
        $balanceAfter  = max(0, $balanceBefore + $amount);

        return [
            'user_leave_setting_id' => UserLeaveSetting::factory(),
            'user_id'               => User::factory(),
            'type'                  => $type,
            'amount'                => $amount,
            'balance_before'        => $balanceBefore,
            'balance_after'         => $balanceAfter,
            'description'           => $this->getDescriptionForType($type),
            'metadata'              => $this->getMetadataForType($type),
            'accrual_date'          => $this->faker->dateTimeBetween('-1 year', 'now'),
            'processed_at'          => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Create an accrual log.
     */
    public function accrual(): static
    {
        return $this->state(fn(array $attributes) => [
            'type'        => LeaveAccrualLog::TYPE_ACCRUAL,
            'amount'      => $this->faker->randomFloat(2, 1, 5),
            'description' => 'Monthly accrual',
        ]);
    }

    /**
     * Create a deduction log.
     */
    public function deduction(): static
    {
        return $this->state(fn(array $attributes) => [
            'type'        => LeaveAccrualLog::TYPE_DEDUCTION,
            'amount'      => -$this->faker->randomFloat(2, 0.5, 10),
            'description' => 'Leave taken',
        ]);
    }

    /**
     * Create an adjustment log.
     */
    public function adjustment(): static
    {
        return $this->state(fn(array $attributes) => [
            'type'        => LeaveAccrualLog::TYPE_ADJUSTMENT,
            'amount'      => $this->faker->randomFloat(2, -5, 5),
            'description' => 'Manual adjustment',
        ]);
    }

    /**
     * Create a carry-over log.
     */
    public function carryOver(): static
    {
        return $this->state(fn(array $attributes) => [
            'type'         => LeaveAccrualLog::TYPE_CARRY_OVER,
            'amount'       => $this->faker->randomFloat(2, 1, 15),
            'description'  => 'Year-end carry-over',
            'accrual_date' => Carbon::createFromDate($this->faker->year(), 12, 31),
        ]);
    }

    /**
     * Set a specific user for the log.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn(array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Set a specific user leave setting for the log.
     */
    public function forUserLeaveSetting(UserLeaveSetting $userLeaveSetting): static
    {
        return $this->state(fn(array $attributes) => [
            'user_leave_setting_id' => $userLeaveSetting->id,
            'user_id'               => $userLeaveSetting->user_id,
        ]);
    }

    /**
     * Set a specific date for the log.
     */
    public function onDate(Carbon $date): static
    {
        return $this->state(fn(array $attributes) => [
            'accrual_date' => $date,
            'processed_at' => $date->copy()->addMinutes($this->faker->numberBetween(1, 60)),
        ]);
    }

    /**
     * Get amount based on transaction type.
     */
    private function getAmountForType(string $type): float
    {
        return match ($type) {
            LeaveAccrualLog::TYPE_ACCRUAL    => $this->faker->randomFloat(2, 1, 5),
            LeaveAccrualLog::TYPE_DEDUCTION  => -$this->faker->randomFloat(2, 0.5, 10),
            LeaveAccrualLog::TYPE_ADJUSTMENT => $this->faker->randomFloat(2, -5, 5),
            LeaveAccrualLog::TYPE_CARRY_OVER => $this->faker->randomFloat(2, 1, 15),
            default                          => $this->faker->randomFloat(2, -5, 5),
        };
    }

    /**
     * Get description based on transaction type.
     */
    private function getDescriptionForType(string $type): string
    {
        return match ($type) {
            LeaveAccrualLog::TYPE_ACCRUAL    => $this->faker->randomElement([
                'Monthly accrual',
                'Quarterly accrual',
                'Yearly accrual',
                'Bi-monthly accrual',
            ]),
            LeaveAccrualLog::TYPE_DEDUCTION  => $this->faker->randomElement([
                'Vacation leave taken',
                'Sick leave taken',
                'Emergency leave taken',
                'Leave request approved',
            ]),
            LeaveAccrualLog::TYPE_ADJUSTMENT => $this->faker->randomElement([
                'Manual adjustment',
                'Administrative correction',
                'Overtime conversion',
                'Policy change adjustment',
            ]),
            LeaveAccrualLog::TYPE_CARRY_OVER => $this->faker->randomElement([
                'Year-end carry-over',
                'Annual balance carry-over',
            ]),
            default                          => 'Leave transaction',
        };
    }

    /**
     * Get metadata based on transaction type.
     */
    private function getMetadataForType(string $type): array
    {
        return match ($type) {
            LeaveAccrualLog::TYPE_ACCRUAL    => [
                'accrual_frequency' => $this->faker->numberBetween(1, 4),
                'scheduled_amount'  => $this->faker->randomFloat(2, 1, 5),
                'capped'            => $this->faker->boolean(20),
            ],
            LeaveAccrualLog::TYPE_DEDUCTION  => [
                'leave_request_id' => $this->faker->optional()->numberBetween(1, 1000),
                'approved_by'      => $this->faker->optional()->numberBetween(1, 100),
            ],
            LeaveAccrualLog::TYPE_ADJUSTMENT => [
                'admin_user_id' => $this->faker->numberBetween(1, 10),
                'reason'        => $this->faker->randomElement(['correction', 'policy_change', 'overtime_conversion']),
            ],
            LeaveAccrualLog::TYPE_CARRY_OVER => [
                'year_end_date'  => Carbon::createFromDate($this->faker->year(), 12, 31)->toDateString(),
                'max_carry_over' => $this->faker->randomFloat(2, 5, 15),
                'forfeited'      => $this->faker->randomFloat(2, 0, 10),
            ],
            default                          => [],
        };
    }
}
