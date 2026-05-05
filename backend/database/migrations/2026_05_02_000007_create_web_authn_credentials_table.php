<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('web_authn_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->uuid('credential_id');
            $table->text('public_key');
            $table->string('name')->nullable();
            $table->bigInteger('counter')->default(0);
            $table->string('transports')->nullable();
            $table->string('device_type')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'credential_id']);
            $table->index('credential_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('web_authn_credentials');
    }
};