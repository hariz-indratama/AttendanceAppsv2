<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('office_location_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('clock_in');
            $table->timestamp('clock_out')->nullable();
            $table->decimal('lat_in', 10, 8)->nullable();
            $table->decimal('long_in', 11, 8)->nullable();
            $table->decimal('lat_out', 10, 8)->nullable();
            $table->decimal('long_out', 11, 8)->nullable();
            $table->enum('status', ['present', 'late', 'absent', 'half_day'])->default('present');
            $table->decimal('total_hours', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->string('device_id')->nullable();
            $table->boolean('biometric_verified')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'clock_in']);
            $table->index(['user_id', 'clock_in', 'clock_out']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};