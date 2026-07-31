<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->string('module', 50)->nullable()->after('action');
            $table->string('browser', 100)->nullable()->after('user_agent');
            $table->string('operating_system', 100)->nullable()->after('browser');

            $table->index('module');
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['module']);
            $table->dropColumn(['module', 'browser', 'operating_system']);
        });
    }
};
