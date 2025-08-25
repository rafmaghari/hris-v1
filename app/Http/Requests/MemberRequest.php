<?php

namespace App\Http\Requests;

use App\Enums\Gender;
use App\Enums\LifeStage;
use App\Enums\Status;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MemberRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('members')->ignore($this->member),
            ],
            'gender' => ['required', 'integer', Rule::enum(Gender::class)],
            'birth_date' => ['required', 'date'],
            'address' => ['required', 'string', 'max:500'],
            'status' => ['required', 'integer', Rule::enum(Status::class)],
            'life_stage' => ['required', 'integer', Rule::enum(LifeStage::class)],
            'group_id' => ['required', 'exists:groups,id'],
        ];
    }
}
