<?php

namespace App\Http\Requests;

use App\Enums\TicketPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can('create', \App\Models\Ticket::class) ?? false; }
    public function rules(): array
    {
        return ['subject' => ['required', 'string', 'max:160'], 'description' => ['required', 'string', 'min:10'], 'category_id' => ['required', 'exists:categories,id'], 'priority' => ['required', Rule::enum(TicketPriority::class)], 'attachments' => ['nullable', 'array', 'max:5'], 'attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,gif,pdf,txt']];
    }
}
