<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $conversations = Conversation::where('user_id', $request->user()->id)
            ->get(['id', 'name', 'phone_number']);

        return response()->json($conversations);
    }

    public function show(Request $request, Conversation $conversation)
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $conversation->load('messages');

        return response()->json($conversation);
    }
}
