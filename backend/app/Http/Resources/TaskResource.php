<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'assigned_to' => $this->assigned_to,
            'assignee' => $this->whenLoaded('assignee', fn () => new EmployeeResource($this->assignee)),
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
            ]),
            'task_status_id' => $this->task_status_id,
            'task_status' => $this->whenLoaded('taskStatus', fn () => [
                'id' => $this->taskStatus->id,
                'name' => $this->taskStatus->name,
                'code' => $this->taskStatus->code,
                'color' => $this->taskStatus->color,
                'is_closed' => $this->taskStatus->is_closed,
            ]),
            'priority_id' => $this->priority_id,
            'priority' => $this->whenLoaded('priority', fn () => [
                'id' => $this->priority->id,
                'name' => $this->priority->name,
                'code' => $this->priority->code,
                'level' => $this->priority->level,
                'color' => $this->priority->color,
            ]),
            'start_date' => $this->start_date?->format('Y-m-d'),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'notes' => $this->notes,
            'completed_at' => $this->completed_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'attachments' => $this->whenLoaded('attachments', fn () => AttachmentResource::collection($this->attachments)),
            'comments' => $this->whenLoaded('comments', fn () => TaskCommentResource::collection($this->comments)),
            'comments_count' => $this->when(isset($this->comments_count), $this->comments_count),
            'is_overdue' => $this->due_date
                && ! $this->completed_at
                && $this->due_date->isPast()
                && ! ($this->taskStatus?->is_closed ?? false),
        ];
    }
}
