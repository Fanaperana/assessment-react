<?php

namespace App\Http\Requests;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can('update', $this->route('ticket')) ?? false; }
    public function rules(): array { return ['status' => ['sometimes', 'required', Rule::enum(TicketStatus::class)], 'priority' => ['sometimes', 'required', Rule::enum(TicketPriority::class)], 'category_id' => ['sometimes', 'required', 'exists:categories,id']]; }
}
