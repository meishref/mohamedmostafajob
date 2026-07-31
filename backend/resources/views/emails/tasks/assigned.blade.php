<x-mail::message>
# {{ $action === 'assigned' ? 'New Task Assigned' : ($action === 'due_date_changed' ? 'Task Due Date Changed' : 'Task Updated') }}

Hello {{ $employeeName }},

@if ($action === 'assigned')
You have been assigned a new task.
@elseif ($action === 'due_date_changed')
The due date for one of your tasks has changed.
@else
One of your assigned tasks has been updated.
@endif

**Task:** {{ $task->title }}

@if ($task->description)
**Description:**  
{{ $task->description }}
@endif

**Priority:** {{ $task->priority?->name ?? '—' }}  
**Status:** {{ $task->taskStatus?->name ?? '—' }}  
**Due date:** {{ $task->due_date?->format('Y-m-d') ?? '—' }}  
**Assigned by:** {{ $task->creator?->name ?? '—' }}

<x-mail::button :url="$taskUrl">
Open Task
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
