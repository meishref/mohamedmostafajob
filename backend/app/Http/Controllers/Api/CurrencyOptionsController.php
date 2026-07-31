<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Models\ExchangeRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyOptionsController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user(), 401);

        $from = ExchangeRate::query()->distinct()->pluck('from_currency');
        $to = ExchangeRate::query()->distinct()->pluck('to_currency');

        $currencies = $from->merge($to)->unique()->sort()->values()->map(fn (string $code) => [
            'code' => $code,
            'label' => $code,
        ]);

        if ($currencies->isEmpty()) {
            $currencies = collect(['USD', 'EUR', 'GBP'])->map(fn (string $code) => [
                'code' => $code,
                'label' => $code,
            ]);
        }

        return $this->successResponse($currencies, 'Currency options retrieved successfully.');
    }
}
