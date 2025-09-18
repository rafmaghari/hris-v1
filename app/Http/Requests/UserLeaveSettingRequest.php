<?php
namespace App\Http\Requests;

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use Illuminate\Foundation\Http\FormRequest;

class UserLeaveSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id'                    => ['required', 'exists:users,id'],
            'leave_settings_template_id' => ['required', 'exists:leave_settings_templates,id'],
            'start_date'                 => ['required', 'date'],
            'end_date'                   => ['nullable', 'date', 'after:start_date'],
            'accrual_type'               => ['required', 'integer', 'in:' . implode(',', LeadAccrualType::values())],
            'accrual_frequency'          => ['nullable', 'integer', 'in:' . implode(',', LeadAccrualFrequencyType::values())],
            'accrual_amount'             => ['nullable', 'numeric', 'min:0'],
            'max_cap'                    => ['required', 'numeric', 'min:0'],
            'allow_carry_over'           => ['boolean'],
            'max_carry_over'             => ['nullable', 'numeric', 'min:0'],
            'current_balance'            => ['nullable', 'numeric', 'min:0'],
            'carried_over'               => ['nullable', 'numeric', 'min:0'],
            'allow_custom_settings'      => ['boolean'],
        ];
    }
}
