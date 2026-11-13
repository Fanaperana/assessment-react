<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function download(Attachment $attachment)
    {
        $attachment->loadMissing('attachable');
        $ticket = $attachment->attachable instanceof \App\Models\Ticket ? $attachment->attachable : $attachment->attachable->loadMissing('ticket')->ticket;
        $this->authorize('view', $ticket);
        abort_unless(Storage::disk($attachment->disk)->exists($attachment->path), 404);
        return response()->download(Storage::disk($attachment->disk)->path($attachment->path), $attachment->original_name);
    }
}
