<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->char('from_currency', 3);
            $table->char('to_currency', 3);
            $table->decimal('rate', 15, 6);
            $table->date('effective_date');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['from_currency', 'to_currency', 'effective_date'], 'exchange_rates_unique');
            $table->index('effective_date');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'read_at']);
            $table->index('type');
            $table->index('created_at');
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject_type')->nullable();
            $table->uuid('subject_id')->nullable();
            $table->string('action', 50);
            $table->text('description')->nullable();
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['subject_type', 'subject_id']);
            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('exchange_rates');
    }
};
