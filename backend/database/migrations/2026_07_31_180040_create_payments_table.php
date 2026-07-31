<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('payment_number', 50)->unique();
            $table->foreignUuid('employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignUuid('payment_type_id')->constrained('payment_types')->restrictOnDelete();
            $table->foreignUuid('payment_status_id')->constrained('payment_statuses')->restrictOnDelete();
            $table->decimal('amount', 15, 2);
            $table->char('currency', 3)->default('USD');
            $table->date('payment_date')->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('employee_id');
            $table->index('payment_type_id');
            $table->index('payment_status_id');
            $table->index('payment_date');
            $table->index('currency');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
