<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $today = Carbon::today();

        $presentToday = Attendance::whereDate('clock_in', $today)
            ->where('status', 'present')
            ->count();

        $lateToday = Attendance::whereDate('clock_in', $today)
            ->where('status', 'late')
            ->count();

        $absentToday = Attendance::whereDate('clock_in', $today)
            ->where('status', 'absent')
            ->count();

        $totalHoursToday = Attendance::whereDate('clock_in', $today)
            ->whereNotNull('total_hours')
            ->sum('total_hours');

        return response()->json([
            'success' => true,
            'data' => [
                'present_today' => $presentToday,
                'late_today' => $lateToday,
                'absent_today' => $absentToday,
                'total_hours_today' => round((float) $totalHoursToday, 1),
            ],
        ]);
    }

    public function todayActivity(): JsonResponse
    {
        $today = Carbon::today();

        $attendances = Attendance::with('user:id,name,email')
            ->whereDate('clock_in', $today)
            ->orderBy('clock_in', 'desc')
            ->get()
            ->map(fn ($record) => [
                'id' => $record->id,
                'user_id' => $record->user_id,
                'user_name' => $record->user?->name ?? 'Unknown',
                'clock_in' => $record->clock_in?->toIso8601String(),
                'clock_out' => $record->clock_out?->toIso8601String(),
                'status' => $record->status,
                'total_hours' => $record->total_hours,
            ]);

        return response()->json([
            'success' => true,
            'data' => $attendances,
        ]);
    }
}