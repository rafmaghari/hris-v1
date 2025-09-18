<?php
namespace Database\Factories;

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use App\Models\LeaveSettingsTemplate;
use App\Models\User;
use App\Models\UserLeaveSetting;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserLeaveSetting>
 */
class UserLeaveSettingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = UserLeaveSetting::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $accrualType = $this->faker->randomElement(LeadAccrualType::cases());

        return [
            'user_id'                    => User::factory(),
            'leave_settings_template_id' => LeaveSettingsTemplate::factory(),
            'start_date'                 => $this->faker->dateTimeBetween('-2 years', '-1 month'),
            'end_date'                   => $this->faker->optional(0.3)->dateTimeBetween('now', '+1 year'),
            'accrual_type'               => $accrualType,
            'accrual_frequency'          => $accrualType === LeadAccrualType::ACCRUAL ? $this->faker->randomElement(LeadAccrualFrequencyType::cases()) : null,
            'accrual_amount'             => $accrualType === LeadAccrualType::ACCRUAL ? $this->faker->randomFloat(2, 1, 5) : null,
            'max_cap'                    => $this->faker->randomFloat(2, 20, 50),
            'allow_carry_over'           => $this->faker->boolean(),
            'max_carry_over'             => $this->faker->randomFloat(2, 5, 15),
            'current_balance'            => $this->faker->randomFloat(2, 0, 30),
            'carried_over'               => $this->faker->randomFloat(2, 0, 10),
            'allow_custom_settings'      => $this->faker->boolean(),
        ];
    }

    /**
     * Create an accrual type setting.
     */
    public function accrual(): static
    {
        return $this->state(fn(array $attributes) => [
            'accrual_type'      => LeadAccrualType::ACCRUAL,
            'accrual_frequency' => $this->faker->randomElement(LeadAccrualFrequencyType::cases()),
            'accrual_amount'    => $this->faker->randomFloat(2, 1, 5),
        ]);
    }

    /**
     * Create a fixed type setting.
     */
    public function fixed(): static
    {
        return $this->state(fn(array $attributes) => [
            'accrual_type'      => LeadAccrualType::FIXED,
            'accrual_frequency' => null,
            'accrual_amount'    => null,
        ]);
    }

    /**
     * Create a monthly accrual setting.
     */
    public function monthly(): static
    {
        return $this->accrual()->state(fn(array $attributes) => [
            'accrual_frequency' => LeadAccrualFrequencyType::MONTHLY,
        ]);
    }

    /**
     * Create a setting with carry-over allowed.
     */
    public function withCarryOver(): static
    {
        return $this->state(fn(array $attributes) => [
            'allow_carry_over' => true,
            'max_carry_over'   => $this->faker->randomFloat(2, 5, 15),
        ]);
    }

    /**
     * Create a setting with no carry-over.
     */
    public function noCarryOver(): static
    {
        return $this->state(fn(array $attributes) => [
            'allow_carry_over' => false,
            'max_carry_over'   => 0,
        ]);
    }

    /**
     * Create a setting with specific balance.
     */
    public function withBalance(float $balance): static
    {
        return $this->state(fn(array $attributes) => [
            'current_balance' => $balance,
        ]);
    }

    /**
     * Create a setting that started recently.
     */
    public function recentStart(): static
    {
        return $this->state(fn(array $attributes) => [
            'start_date' => Carbon::today()->subDays($this->faker->numberBetween(1, 30)),
        ]);
    }

    /**
     * Create a setting that started long ago.
     */
    public function oldStart(): static
    {
        return $this->state(fn(array $attributes) => [
            'start_date' => Carbon::today()->subMonths($this->faker->numberBetween(6, 24)),
        ]);
    }
}
