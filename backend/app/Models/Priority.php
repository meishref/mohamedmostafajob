<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Database\Factories\PriorityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Priority extends Model
{
    /** @use HasFactory<PriorityFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = ['name', 'code', 'level', 'color'];

    protected function casts(): array
    {
        return ['level' => 'integer'];
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
