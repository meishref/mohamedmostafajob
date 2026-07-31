<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('employee_number', 50)->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->foreignUuid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignUuid('job_title_id')->nullable()->constrained('job_titles')->nullOnDelete();
            $table->foreignUuid('employee_status_id')->constrained('employee_statuses')->restrictOnDelete();
            $table->date('hire_date')->nullable();
            $table->date('termination_date')->nullable();
            $table->string('profile_image')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('department_id');
            $table->index('job_title_id');
            $table->index('employee_status_id');
            $table->index(['last_name', 'first_name']);
            $table->index('hire_date');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->foreignUuid('head_employee_id')->nullable()->after('parent_id')
                ->constrained('employees')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('head_employee_id');
        });

        Schema::dropIfExists('employees');
    }
};
