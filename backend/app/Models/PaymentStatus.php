<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Database\Factories\PaymentStatusFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentStatus extends Model
{
    /** @use HasFactory<PaymentStatusFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = ['name', 'code', 'color', 'is_final'];

    protected function casts(): array
    {
        return ['is_final' => 'boolean'];
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
