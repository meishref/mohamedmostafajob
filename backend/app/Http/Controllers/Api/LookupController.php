<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\Settings\IndexLookupRequest;
use App\Http\Requests\Settings\StoreLookupRequest;
use App\Http\Requests\Settings\UpdateLookupRequest;
use App\Services\Settings\LookupCrudService;
use App\Services\System\SystemEventService;
use App\Support\Settings\SettingsRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LookupController extends BaseController
{
    public function __construct(
        private readonly SystemEventService $systemEventService,
    ) {}

    private function service(string $resource): LookupCrudService
    {
        return new LookupCrudService($resource);
    }

    public function resources(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        $resources = collect(SettingsRegistry::all())->map(fn ($config, $slug) => [
            'slug' => $slug,
            'label' => $config['label'],
        ])->values();

        return $this->successResponse($resources, 'Settings resources retrieved successfully.');
    }

    public function index(IndexLookupRequest $request, string $resource): JsonResponse
    {
        $service = $this->service($resource);
        $paginator = $service->list($request->filters());
        $resourceClass = SettingsRegistry::resourceClass($resource);

        return $this->successResponse(
            $resourceClass::collection($paginator->items())->resolve(),
            SettingsRegistry::get($resource)['label'].' retrieved successfully.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        );
    }

    public function store(StoreLookupRequest $request, string $resource): JsonResponse
    {
        $service = $this->service($resource);
        $record = $service->create($request->validated());
        $resourceClass = SettingsRegistry::resourceClass($resource);
        $label = SettingsRegistry::get($resource)['label'];

        $this->systemEventService->settingsChanged($record, 'created', $label, $request->validated());

        return $this->createdResponse([
            'item' => new $resourceClass($record),
        ], $label.' created successfully.');
    }

    public function show(Request $request, string $resource, string $id): JsonResponse
    {
        abort_unless($request->user()?->can('settings.view'), 403);

        $service = $this->service($resource);
        $record = $service->find($id);
        $resourceClass = SettingsRegistry::resourceClass($resource);

        return $this->successResponse([
            'item' => new $resourceClass($record),
        ]);
    }

    public function update(UpdateLookupRequest $request, string $resource, string $id): JsonResponse
    {
        $service = $this->service($resource);
        $record = $service->update($id, $request->validated());
        $resourceClass = SettingsRegistry::resourceClass($resource);
        $label = SettingsRegistry::get($resource)['label'];

        $this->systemEventService->settingsChanged($record, 'updated', $label, $request->validated());

        return $this->successResponse([
            'item' => new $resourceClass($record),
        ], $label.' updated successfully.');
    }

    public function destroy(Request $request, string $resource, string $id): JsonResponse
    {
        abort_unless($request->user()?->can('settings.manage'), 403);

        $service = $this->service($resource);
        $record = $service->find($id);
        $label = SettingsRegistry::get($resource)['label'];

        $service->delete($id);

        $this->systemEventService->settingsChanged($record, 'deleted', $label);

        return $this->successResponse(null, $label.' deleted successfully.');
    }

    public function restore(Request $request, string $resource, string $id): JsonResponse
    {
        abort_unless($request->user()?->can('settings.manage'), 403);

        $record = $this->service($resource)->restore($id);
        $resourceClass = SettingsRegistry::resourceClass($resource);
        $label = SettingsRegistry::get($resource)['label'];

        $this->systemEventService->settingsChanged($record, 'restored', $label);

        return $this->successResponse([
            'item' => new $resourceClass($record),
        ], $label.' restored successfully.');
    }
}
