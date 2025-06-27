<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'content',
        'attachment_path',
        'is_outgoing',
    ];

    protected $appends = ['attachment_url'];

    public function getAttachmentUrlAttribute(): ?string
    {
        return $this->attachment_path ? asset('storage/'.$this->attachment_path) : null;
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}
