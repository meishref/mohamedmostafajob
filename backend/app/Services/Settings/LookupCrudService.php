<?php

namespace App\Services\Settings;

use App\Repositories\Settings\LookupRepository;
use App\Support\Settings\SettingsRegistry;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class LookupCrudService
{
    private LookupRepository $repository;

    /** @var array<string, mixed> */
    private array $config;

    public function __construct(private readonly string $resource)
    {
        $this->config = SettingsRegistry::get($resource);
        $this->repository = new LookupRepository(
            $this->config['model'],
            $this->config['searchable'],
            $this->config['sortable'],
        );
    }

    public function list(array $filters): LengthAwarePaginator
    {
        $paginator = $this->repository->paginate($filters);

        if (! empty($this->config['relations'])) {
            $paginator->getCollection()->load($this->config['relations']);
        }

        return $paginator;
    }

    public function find(string $id): Model
    {
        $model = $this->repository->find($id);

        if (! empty($this->config['relations'])) {
            $model->load($this->config['relations']);
        }

        return $model;
    }

    public function create(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function update(string $id, array $data): Model
    {
        $model = $this->repository->find($id);

        return $this->repository->update($model, $data);
    }

    public function delete(string $id): void
    {
        $this->repository->delete($this->repository->find($id));
    }

    public function restore(string $id): Model
    {
        return $this->repository->restore($this->repository->find($id));
    }

    /** @return array<string, mixed> */
    public function config(): array
    {
        return $this->config;
    }

    public function resource(): string
    {
        return $this->resource;
    }
}
