<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Database\Factories\TaskStatusFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskStatus extends Model
{
    /** @use HasFactory<TaskStatusFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = ['name', 'code', 'color', 'sort_order', 'is_default', 'is_closed'];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_default' => 'boolean',
            'is_closed' => 'boolean',
        ];
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
