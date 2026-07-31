<?php

namespace App\Repositories\Settings;

use App\Exceptions\ApiException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpFoundation\Response;

class LookupRepository
{
    /** @param class-string<Model> $modelClass */
    public function __construct(
        private readonly string $modelClass,
        private readonly array $searchable = ['name', 'code'],
        private readonly array $sortable = ['name', 'code', 'created_at'],
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        /** @var Model $model */
        $model = new ($this->modelClass);
        $query = $model->newQuery();

        if (method_exists($model, 'trashed')) {
            if (($filters['trashed'] ?? 'without') === 'only') {
                $query->onlyTrashed();
            } elseif (($filters['trashed'] ?? 'without') === 'with') {
                $query->withTrashed();
            }
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                foreach ($this->searchable as $field) {
                    $q->orWhere($field, 'like', "%{$search}%");
                }
            });
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '' && $filters['is_active'] !== null) {
            if ($this->hasColumn('is_active')) {
                $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
            }
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';

        if (in_array($sortField, $this->sortable, true)) {
            $query->orderBy($sortField, $sortDirection);
        }

        return $query->paginate(
            perPage: (int) ($filters['per_page'] ?? 15),
            page: (int) ($filters['page'] ?? 1),
        );
    }

    public function find(string $id): Model
    {
        /** @var Model|null $record */
        $record = $this->modelClass::query()->withTrashed()->find($id);

        if (! $record) {
            throw new ApiException('Record not found.', Response::HTTP_NOT_FOUND);
        }

        return $record;
    }

    public function create(array $data): Model
    {
        return $this->modelClass::query()->create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);

        return $model->fresh();
    }

    public function delete(Model $model): void
    {
        $model->delete();
    }

    public function restore(Model $model): Model
    {
        $model->restore();

        return $model->fresh();
    }

    private function hasColumn(string $column): bool
    {
        /** @var Model $model */
        $model = new ($this->modelClass);

        return in_array($column, $model->getFillable(), true)
            || array_key_exists($column, $model->getCasts());
    }
}
