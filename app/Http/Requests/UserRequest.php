<?php

namespace App\Http\Requests;

use App\Enums\EmploymentType;
use App\Enums\Status;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $this->user?->id],
            'password' => ['nullable', Password::defaults()],
            'position_id' => ['nullable', 'exists:positions,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'manager_id' => ['nullable', 'exists:users,id'],
            'date_hired' => ['nullable', 'date'],
            'employment_type' => ['nullable', 'string', 'in:' . implode(',', EmploymentType::values())],
            'status' => ['nullable', 'integer', 'in:' . implode(',', Status::values())],
            'end_at' => ['nullable', 'date', 'after:date_hired'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['exists:roles,id'],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ];
    }
}
