<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Controller as BaseController;
use App\Http\Requests\Employee\IndexEmployeeRequest;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\Employee\EmployeeService;
use Illuminate\Http\JsonResponse;

class EmployeeController extends BaseController
{
    public function __construct(
        private readonly EmployeeService $employeeService,
    ) {}

    public function index(IndexEmployeeRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Employee::class);

        $paginator = $this->employeeService->list($request->filters());

        return $this->successResponse(
            EmployeeResource::collection($paginator->items())->resolve(),
            'Employees retrieved successfully.',
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

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $this->authorize('create', Employee::class);

        $employee = $this->employeeService->create(
            $request->validated(),
            $request->file('profile_image'),
        );

        return $this->createdResponse([
            'employee' => new EmployeeResource($employee),
        ], 'Employee created successfully.');
    }

    public function show(string $employee): JsonResponse
    {
        $model = $this->employeeService->find($employee);
        $this->authorize('view', $model);

        return $this->successResponse([
            'employee' => new EmployeeResource($model),
        ]);
    }

    public function update(UpdateEmployeeRequest $request, string $employee): JsonResponse
    {
        $model = $this->employeeService->find($employee);
        $this->authorize('update', $model);

        $updated = $this->employeeService->update(
            $model,
            $request->validated(),
            $request->file('profile_image'),
        );

        return $this->successResponse([
            'employee' => new EmployeeResource($updated),
        ], 'Employee updated successfully.');
    }

    public function destroy(string $employee): JsonResponse
    {
        $model = $this->employeeService->find($employee);
        $this->authorize('delete', $model);

        $this->employeeService->delete($model);

        return $this->successResponse(null, 'Employee deleted successfully.');
    }

    public function restore(string $employee): JsonResponse
    {
        $model = $this->employeeService->find($employee);
        $this->authorize('restore', $model);

        $restored = $this->employeeService->restore($model);

        return $this->successResponse([
            'employee' => new EmployeeResource($restored),
        ], 'Employee restored successfully.');
    }
}
