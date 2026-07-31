<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\Search\GlobalSearchRequest;
use App\Services\Search\GlobalSearchService;
use Illuminate\Http\JsonResponse;

class GlobalSearchController extends BaseController
{
    public function __construct(
        private readonly GlobalSearchService $globalSearchService,
    ) {}

    public function __invoke(GlobalSearchRequest $request): JsonResponse
    {
        $data = $this->globalSearchService->search(
            $request->user(),
            $request->input('q'),
        );

        return $this->successResponse($data, 'Search completed successfully.');
    }
}
