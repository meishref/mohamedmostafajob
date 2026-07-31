<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Database\Factories\ActivityLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    /** @use HasFactory<ActivityLogFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id', 'subject_type', 'subject_id', 'action', 'module',
        'description', 'properties', 'ip_address', 'user_agent',
        'browser', 'operating_system',
    ];

    protected function casts(): array
    {
        return ['properties' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }
}
