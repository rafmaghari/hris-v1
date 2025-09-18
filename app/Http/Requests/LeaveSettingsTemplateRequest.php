<?php
namespace App\Http\Requests;

use App\Enums\LeadAccrualFrequencyType;
use App\Enums\LeadAccrualType;
use App\Enums\Status;
use Illuminate\Foundation\Http\FormRequest;

class LeaveSettingsTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'              => ['required', 'string', 'max:255'],
            'leave_type_id'     => ['required', 'exists:leave_types,id'],
            'accrual_type'      => ['required', 'integer', 'in:' . implode(',', LeadAccrualType::values())],
            'fixed_days'        => ['nullable', 'integer', 'min:0'],
            'accrual_frequency' => ['nullable', 'integer', 'in:' . implode(',', LeadAccrualFrequencyType::values())],
            'accrual_amount'    => ['nullable', 'numeric', 'min:0'],
            'max_cap'           => ['nullable', 'numeric', 'min:0'],
            'allow_carry_over'  => ['boolean'],
            'max_carry_over'    => ['nullable', 'integer', 'min:0'],
            'status'            => ['required', 'integer', 'in:' . implode(',', Status::values())],
        ];
    }
}
