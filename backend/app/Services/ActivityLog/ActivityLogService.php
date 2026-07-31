<?php

namespace App\Services\ActivityLog;

use App\Models\ActivityLog;
use App\Support\UserAgentParser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    public function log(
        Model $subject,
        string $action,
        ?string $description = null,
        ?array $properties = null,
        ?string $module = null,
    ): ActivityLog {
        return $this->record(
            action: $action,
            description: $description,
            properties: $properties,
            module: $module ?? $this->moduleFromModel($subject),
            subject: $subject,
        );
    }

    public function record(
        string $action,
        ?string $description = null,
        ?array $properties = null,
        ?string $module = null,
        ?Model $subject = null,
        ?string $userId = null,
    ): ActivityLog {
        $agent = UserAgentParser::parse(request()->userAgent());

        return ActivityLog::query()->create([
            'user_id' => $userId ?? Auth::id(),
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'browser' => $agent['browser'],
            'operating_system' => $agent['operating_system'],
        ]);
    }

    private function moduleFromModel(Model $model): string
    {
        return strtolower(class_basename($model));
    }
}
