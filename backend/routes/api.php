<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// All API routes wrapped with CORS middleware
Route::middleware('cors')->group(function () {
    // Public routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });

    // WebAuthn public routes
    Route::prefix('webauthn')->group(function () {
        Route::post('/register/options', [App\Http\Controllers\Api\WebAuthnController::class, 'registerOptions']);
        Route::post('/register/verify', [App\Http\Controllers\Api\WebAuthnController::class, 'registerVerify']);
        Route::post('/login/options', [App\Http\Controllers\Api\WebAuthnController::class, 'loginOptions']);
        Route::post('/login/verify', [App\Http\Controllers\Api\WebAuthnController::class, 'loginVerify']);
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/user', [AuthController::class, 'user']);
            Route::post('/refresh', [AuthController::class, 'refresh']);
        });

        // Employee attendance
        Route::prefix('attendance')->group(function () {
            Route::post('/clock-in', [App\Http\Controllers\Api\AttendanceController::class, 'clockIn']);
            Route::post('/clock-out', [App\Http\Controllers\Api\AttendanceController::class, 'clockOut']);
            Route::get('/today', [App\Http\Controllers\Api\AttendanceController::class, 'today']);
            Route::get('/history', [App\Http\Controllers\Api\AttendanceController::class, 'history']);
        });

        // Admin routes
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('/employees', [App\Http\Controllers\Admin\EmployeeController::class, 'index']);
            Route::post('/employees', [App\Http\Controllers\Admin\EmployeeController::class, 'store']);
            Route::get('/employees/{id}', [App\Http\Controllers\Admin\EmployeeController::class, 'show']);
            Route::put('/employees/{id}', [App\Http\Controllers\Admin\EmployeeController::class, 'update']);
            Route::delete('/employees/{id}', [App\Http\Controllers\Admin\EmployeeController::class, 'destroy']);

            Route::get('/attendances', [App\Http\Controllers\Admin\AttendanceController::class, 'index']);
            Route::put('/attendances/{id}', [App\Http\Controllers\Admin\AttendanceController::class, 'update']);

            Route::post('/payroll/generate', [App\Http\Controllers\Admin\PayrollController::class, 'generate']);
            Route::get('/payroll', [App\Http\Controllers\Admin\PayrollController::class, 'index']);

            Route::get('/settings', [App\Http\Controllers\Admin\SettingsController::class, 'show']);
            Route::put('/settings', [App\Http\Controllers\Admin\SettingsController::class, 'update']);

            Route::get('/reports/export', [App\Http\Controllers\Admin\ReportController::class, 'export']);
            Route::get('/reports/summary', [App\Http\Controllers\Admin\ReportController::class, 'summary']);

            Route::get('/dashboard/stats', [App\Http\Controllers\Admin\DashboardController::class, 'stats']);
            Route::get('/dashboard/today-activity', [App\Http\Controllers\Admin\DashboardController::class, 'todayActivity']);
        });
    });
});