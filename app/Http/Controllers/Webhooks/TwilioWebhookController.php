<?php

namespace App\Http\Controllers\Webhooks;

use App\DTO\MessageData;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class TwilioWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'From' => 'required|string',
            'Body' => 'nullable|string',
            'NumMedia' => 'nullable|integer',
        ]);

        $from = $validated['From'];
        $body = $validated['Body'] ?? '';

        $conversation = Conversation::firstOrCreate(
            ['phone_number' => $from],
            [
                'user_id' => User::query()->value('id'),
                'name' => null,
            ]
        );

        $attachmentPath = null;
        $numMedia = (int) ($validated['NumMedia'] ?? 0);
        if ($numMedia > 0) {
            $url = $request->input('MediaUrl0');
            if ($url) {
                $extension = pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                try {
                    $response = Http::get($url);
                    if ($response->successful()) {
                        $filename = 'attachments/' . uniqid() . '.' . $extension;
                        Storage::disk('public')->put($filename, $response->body());
                        $attachmentPath = $filename;
                    }
                } catch (\Throwable $th) {
                    // Ignore download failures
                }
            }
        }

        $data = MessageData::create(
            $conversation->id,
            $body,
            $attachmentPath,
            false
        );

        $message = $conversation->messages()->create($data->toArray());

        return response()->json($message, 201);
    }
}
