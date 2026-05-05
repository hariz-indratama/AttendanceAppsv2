<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebAuthnCredential extends Model
{
    use HasFactory;

    #[Fillable(['user_id', 'credential_id', 'public_key', 'name', 'counter', 'transports', 'device_type', 'last_used_at'])]

    protected function casts(): array
    {
        return [
            'counter' => 'integer',
            'last_used_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}