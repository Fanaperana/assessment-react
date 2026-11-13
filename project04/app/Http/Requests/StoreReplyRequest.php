<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReplyRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can('reply', $this->route('ticket')) ?? false; }
    public function rules(): array { return ['body' => ['required', 'string', 'min:2', 'max:10000'], 'internal' => ['sometimes', 'boolean'], 'attachments' => ['nullable', 'array', 'max:5'], 'attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,gif,pdf,txt']]; }
}
