<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class AssignTicketRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->can('assign', $this->route('ticket')) ?? false; }
    public function rules(): array { return ['assignee_id' => ['nullable', 'exists:users,id']]; }
    public function withValidator($validator): void { $validator->after(fn ($v) => $this->assignee_id && !User::whereKey($this->assignee_id)->whereIn('role', ['agent', 'admin'])->exists() ? $v->errors()->add('assignee_id', 'The assignee must be an agent.') : null); }
}
