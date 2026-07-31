<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Database\Factories\ExchangeRateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExchangeRate extends Model
{
    /** @use HasFactory<ExchangeRateFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = ['from_currency', 'to_currency', 'rate', 'effective_date'];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:6',
            'effective_date' => 'date',
        ];
    }
}
