<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AttendanceException;
use App\Exceptions\GeofenceException;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\OfficeLocation;
use App\Services\GeofenceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly GeofenceService $geofenceService
    ) {}

    public function clockIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'device_id' => 'nullable|string',
            'biometric_verified' => 'nullable|boolean',
        ]);

        $user = $request->user();

        // Check if already clocked in today
        $existingAttendance = Attendance::where('user_id', $user->id)
            ->whereDate('clock_in', Carbon::today())
            ->whereNull('clock_out')
            ->first();

        if ($existingAttendance) {
            throw new AttendanceException('Already clocked in today');
        }

        // Get default office location
        $office = OfficeLocation::where('is_active', true)->first();

        if (!$office) {
            throw new AttendanceException('No office location configured', 500);
        }

        // Verify geofence
        $distance = $this->geofenceService->calculateHaversineDistance(
            $validated['latitude'],
            $validated['longitude'],
            (float) $office->latitude,
            (float) $office->longitude
        );

        if ($distance > $office->radius_meters) {
            throw new GeofenceException($distance, (float) $office->radius_meters);
        }

        // Determine if late
        $now = Carbon::now();
        $startTime = Carbon::parse($office->default_start_time);
        $isLate = $now->diffInMinutes($startTime) > 30;

        // Create attendance record
        $attendance = Attendance::create([
            'user_id' => $user->id,
            'office_location_id' => $office->id,
            'clock_in' => $now,
            'lat_in' => $validated['latitude'],
            'long_in' => $validated['longitude'],
            'status' => $isLate ? 'late' : 'present',
            'device_id' => $validated['device_id'] ?? null,
            'biometric_verified' => $validated['biometric_verified'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => $isLate ? 'Clocked in late' : 'Clocked in successfully',
            'data' => [
                'attendance' => $attendance->load('officeLocation'),
                'distance' => round($distance, 2),
                'is_late' => $isLate,
            ],
        ], 201);
    }

    public function clockOut(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Get today's open attendance
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('clock_in', Carbon::today())
            ->whereNull('clock_out')
            ->first();

        if (!$attendance) {
            throw new AttendanceException('No open attendance record found');
        }

        $now = Carbon::now();

        // Calculate total hours
        $totalMinutes = $attendance->clock_in->diffInMinutes($now);
        $totalHours = round($totalMinutes / 60, 2);

        // Update attendance record
        $attendance->update([
            'clock_out' => $now,
            'lat_out' => $validated['latitude'] ?? null,
            'long_out' => $validated['longitude'] ?? null,
            'total_hours' => $totalHours,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Clocked out successfully',
            'data' => [
                'attendance' => $attendance->load('officeLocation'),
                'total_hours' => $totalHours,
            ],
        ]);
    }

    public function today(Request $request): JsonResponse
    {
        $user = $request->user();

        $attendance = Attendance::with('officeLocation')
            ->where('user_id', $user->id)
            ->whereDate('clock_in', Carbon::today())
            ->first();

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = min($request->input('per_page', 30), 100);

        $attendances = Attendance::with('officeLocation')
            ->where('user_id', $user->id)
            ->orderBy('clock_in', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $attendances->items(),
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'per_page' => $attendances->perPage(),
                'total' => $attendances->total(),
            ],
        ]);
    }
}