<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Database\Factories\AdvertisingPlatformFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdvertisingPlatform extends Model
{
    /** @use HasFactory<AdvertisingPlatformFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = ['name', 'code', 'website', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'platform_id');
    }
}
