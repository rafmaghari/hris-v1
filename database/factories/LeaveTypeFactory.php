<?php
namespace Database\Factories;

use App\Models\LeaveType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaveType>
 */
class LeaveTypeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = LeaveType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'        => $this->faker->randomElement([
                'Vacation Leave',
                'Sick Leave',
                'Maternity Leave',
                'Paternity Leave',
                'Emergency Leave',
                'Bereavement Leave',
            ]),
            'description' => $this->faker->sentence(),
            'status'      => 1, // Active
        ];
    }

    /**
     * Indicate that the leave type is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 2,
        ]);
    }
}
