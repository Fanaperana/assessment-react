<?php

use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('tickets', [TicketController::class, 'index']);
    Route::get('tickets/{ticket}', [TicketController::class, 'show']);
    Route::post('tickets', [TicketController::class, 'store']);
    Route::post('tickets/{ticket}/replies', [TicketController::class, 'reply']);
});
