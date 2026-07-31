<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Resources\Settings\LookupOptionResource;
use App\Support\Settings\SettingsRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LookupOptionsController extends BaseController
{
    public function index(Request $request, string $resource): JsonResponse
    {
        abort_unless($request->user(), 401);

        $config = SettingsRegistry::get($resource);
        $modelClass = $config['model'];

        $query = $modelClass::query();

        if ($request->boolean('active_only', true) && in_array('is_active', (new $modelClass)->getFillable(), true)) {
            $query->where('is_active', true);
        }

        if ($search = $request->input('search')) {
            $searchable = $config['searchable'] ?? ['name'];
            $query->where(function ($q) use ($search, $searchable) {
                foreach ($searchable as $field) {
                    $q->orWhere($field, 'like', "%{$search}%");
                }
            });
        }

        $sortField = in_array('sort_order', (new $modelClass)->getFillable(), true) ? 'sort_order' : 'name';
        $items = $query->orderBy($sortField)->limit(500)->get();

        return $this->successResponse(
            LookupOptionResource::collection($items)->resolve(),
            'Lookup options retrieved successfully.',
        );
    }
}
