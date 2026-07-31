<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Database\Factories\PaymentTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentType extends Model
{
    /** @use HasFactory<PaymentTypeFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = ['name', 'code', 'description', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
