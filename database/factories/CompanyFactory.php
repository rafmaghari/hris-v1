<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'type' => fake()->randomElement([Company::TYPE_DEALER, Company::TYPE_MANUFACTURER]),
            'domain' => fake()->domainName(),
            'description' => fake()->paragraph(),
            'caravea_company_id' => 'caraveacomp|'.Str::random(20),
        ];
    }
}
