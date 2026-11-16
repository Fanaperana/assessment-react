<?php

namespace App\Http\Controllers;

use App\Http\Requests\MarkNotificationsReadRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response { return Inertia::render('notifications', ['notifications' => $request->user()->notifications()->latest()->paginate(20)]); }
    public function read(MarkNotificationsReadRequest $request): RedirectResponse { $request->user()->unreadNotifications->markAsRead(); return back(); }
}
