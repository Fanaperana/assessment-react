<?php

namespace Database\Factories;

use App\Models\Attachment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Attachment> */
class AttachmentFactory extends Factory
{
    protected $model = Attachment::class;

    public function definition(): array
    {
        return [
            'uploaded_by_id' => User::factory(),
            'disk' => 'private',
            'path' => 'attachments/'.fake()->uuid().'.txt',
            'original_name' => 'notes.txt',
            'mime_type' => 'text/plain',
            'size' => fake()->numberBetween(100, 10000),
        ];
    }
}
