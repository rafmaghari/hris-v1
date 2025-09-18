<?php
namespace Database\Factories;

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use App\Enums\Status;
use App\Models\LeaveSettingsTemplate;
use App\Models\LeaveType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaveSettingsTemplate>
 */
class LeaveSettingsTemplateFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = LeaveSettingsTemplate::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $accrualType = $this->faker->randomElement(LeadAccrualType::cases());

        return [
            'name'              => $this->faker->words(2, true) . ' Template',
            'leave_type_id'     => LeaveType::factory(),
            'accrual_type'      => $accrualType,
            'fixed_days'        => $accrualType === LeadAccrualType::FIXED ? $this->faker->numberBetween(10, 30) : null,
            'accrual_frequency' => $accrualType === LeadAccrualType::ACCRUAL ? $this->faker->randomElement(LeadAccrualFrequencyType::cases()) : null,
            'accrual_amount'    => $accrualType === LeadAccrualType::ACCRUAL ? $this->faker->randomFloat(2, 1, 5) : null,
            'max_cap'           => $this->faker->randomFloat(2, 20, 50),
            'allow_carry_over'  => $this->faker->boolean(),
            'max_carry_over'    => $this->faker->randomFloat(2, 5, 15),
            'status'            => Status::ACTIVE,
        ];
    }

    /**
     * Create a fixed type template.
     */
    public function fixed(): static
    {
        return $this->state(fn(array $attributes) => [
            'accrual_type'      => LeadAccrualType::FIXED,
            'fixed_days'        => $this->faker->numberBetween(10, 30),
            'accrual_frequency' => null,
            'accrual_amount'    => null,
        ]);
    }

    /**
     * Create an accrual type template.
     */
    public function accrual(): static
    {
        return $this->state(fn(array $attributes) => [
            'accrual_type'      => LeadAccrualType::ACCRUAL,
            'fixed_days'        => null,
            'accrual_frequency' => $this->faker->randomElement(LeadAccrualFrequencyType::cases()),
            'accrual_amount'    => $this->faker->randomFloat(2, 1, 5),
        ]);
    }

    /**
     * Create a monthly accrual template.
     */
    public function monthly(): static
    {
        return $this->accrual()->state(fn(array $attributes) => [
            'accrual_frequency' => LeadAccrualFrequencyType::MONTHLY,
        ]);
    }

    /**
     * Create an inactive template.
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Status::INACTIVE,
        ]);
    }
}
