<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->foreignUuid('parent_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
            $table->index('parent_id');
        });

        Schema::create('job_titles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->foreignUuid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('department_id');
            $table->index('is_active');
        });

        Schema::create('employee_statuses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->string('color', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
            $table->index('sort_order');
        });

        Schema::create('task_statuses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->string('color', 20)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index('sort_order');
            $table->index('is_default');
        });

        Schema::create('priorities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->unsignedSmallInteger('level')->default(0);
            $table->string('color', 20)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('level');
        });

        Schema::create('payment_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
        });

        Schema::create('payment_statuses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->string('color', 20)->nullable();
            $table->boolean('is_final')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_final');
        });

        Schema::create('expense_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
        });

        Schema::create('advertising_platforms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->string('website')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertising_platforms');
        Schema::dropIfExists('expense_categories');
        Schema::dropIfExists('payment_statuses');
        Schema::dropIfExists('payment_types');
        Schema::dropIfExists('priorities');
        Schema::dropIfExists('task_statuses');
        Schema::dropIfExists('employee_statuses');
        Schema::dropIfExists('job_titles');
        Schema::dropIfExists('departments');
    }
};
