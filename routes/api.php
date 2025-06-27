<?php

use App\Http\Controllers\Api\ConversationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::post('conversations', [ConversationController::class, 'store']);
    Route::get('conversations', [ConversationController::class, 'index']);
    Route::get('conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('conversations/{conversation}/messages', [ConversationController::class, 'storeMessage']);
});
