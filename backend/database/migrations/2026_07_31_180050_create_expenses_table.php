<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('expense_number', 50)->unique();
            $table->foreignUuid('category_id')->constrained('expense_categories')->restrictOnDelete();
            $table->foreignUuid('platform_id')->nullable()->constrained('advertising_platforms')->nullOnDelete();
            $table->foreignUuid('employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignUuid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->decimal('amount', 15, 2);
            $table->char('currency', 3)->default('USD');
            $table->date('expense_date');
            $table->text('description')->nullable();
            $table->string('receipt_path')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('category_id');
            $table->index('platform_id');
            $table->index('employee_id');
            $table->index('department_id');
            $table->index('expense_date');
            $table->index('approved_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
