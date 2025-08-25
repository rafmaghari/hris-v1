<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlatformRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('platforms')->ignore($this->platform),
            ],
            'description' => ['nullable', 'string'],
            'url' => ['nullable', 'url', 'max:255'],
            'secret_key' => ['nullable', 'string', 'max:64'],
            'is_active' => ['boolean'],
            'company_ids' => ['nullable', 'array'],
            'company_ids.*' => ['exists:companies,id'],
        ];
    }
}
