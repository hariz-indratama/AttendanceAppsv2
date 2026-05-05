<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('employee')->after('email');
            $table->decimal('hourly_rate', 10, 2)->nullable()->after('role');
            $table->unsignedBigInteger('department_id')->nullable()->after('hourly_rate');
            $table->string('avatar')->nullable()->after('department_id');

            $table->foreign('department_id')
                ->references('id')
                ->on('departments')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn(['role', 'hourly_rate', 'department_id', 'avatar']);
        });
    }
};