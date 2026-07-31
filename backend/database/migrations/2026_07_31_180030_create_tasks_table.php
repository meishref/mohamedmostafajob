<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignUuid('assigned_to')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignUuid('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignUuid('task_status_id')->constrained('task_statuses')->restrictOnDelete();
            $table->foreignUuid('priority_id')->constrained('priorities')->restrictOnDelete();
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('assigned_to');
            $table->index('created_by');
            $table->index('department_id');
            $table->index('task_status_id');
            $table->index('priority_id');
            $table->index('due_date');
            $table->index('completed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
