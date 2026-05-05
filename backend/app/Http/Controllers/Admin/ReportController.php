<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function export(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id',
            'format' => 'nullable|in:json,csv',
        ]);

        $query = Attendance::with('user')
            ->whereBetween('clock_in', [
                Carbon::parse($validated['start_date'])->startOfDay(),
                Carbon::parse($validated['end_date'])->endOfDay(),
            ]);

        if (!empty($validated['user_id'])) {
            $query->where('user_id', $validated['user_id']);
        }

        $attendances = $query->orderBy('clock_in')->get();

        if (($validated['format'] ?? 'json') === 'csv') {
            $csv = $this->generateCsv($attendances);
            return response()->json([
                'success' => true,
                'data' => $csv,
                'format' => 'csv',
            ]);
        }

        $summary = $this->generateSummary($attendances);

        return response()->json([
            'success' => true,
            'data' => $attendances,
            'summary' => $summary,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $query = Attendance::with('user')
            ->whereBetween('clock_in', [
                Carbon::parse($validated['start_date'])->startOfDay(),
                Carbon::parse($validated['end_date'])->endOfDay(),
            ]);

        if (!empty($validated['user_id'])) {
            $query->where('user_id', $validated['user_id']);
        }

        $attendances = $query->orderBy('clock_in')->get();

        $grouped = $attendances->groupBy('user_id');

        $monthlyAttendance = $grouped->map(function ($records, $userId) {
            $user = $records->first()->user;
            return [
                'employee_name' => $user->name,
                'days_present' => $records->whereIn('status', ['present', 'late'])->count(),
                'days_late' => $records->where('status', 'late')->count(),
                'total_hours' => round($records->sum('total_hours') ?? 0, 2),
            ];
        })->values();

        $lateArrivals = $attendances->where('status', 'late')
            ->map(function ($record) {
                $clockIn = Carbon::parse($record->clock_in);
                $officeStart = $clockIn->copy()->setTime(9, 0, 0);
                $delayMinutes = max(0, $clockIn->diffInMinutes($officeStart));
                return [
                    'employee_name' => $record->user->name,
                    'date' => $clockIn->toDateString(),
                    'clock_in_time' => $clockIn->format('H:i:s'),
                    'delay_minutes' => $delayMinutes,
                ];
            })->values();

        $overtime = $grouped->map(function ($records, $userId) {
            $user = $records->first()->user;
            $totalHours = $records->sum('total_hours') ?? 0;
            $expectedHours = $records->count() * 8;
            $overtimeHours = max(0, $totalHours - $expectedHours);
            return [
                'employee_name' => $user->name,
                'overtime_hours' => round($overtimeHours, 2),
            ];
        })->filter(fn($row) => $row['overtime_hours'] > 0)->values();

        return response()->json([
            'success' => true,
            'data' => $attendances,
            'monthly_attendance' => $monthlyAttendance,
            'late_arrivals' => $lateArrivals,
            'overtime' => $overtime,
        ]);
    }

    private function generateCsv($attendances): array
    {
        $csv = [];
        $csv[] = ['Employee', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status'];

        foreach ($attendances as $attendance) {
            $csv[] = [
                $attendance->user->name,
                $attendance->clock_in->format('Y-m-d'),
                $attendance->clock_in->format('H:i:s'),
                $attendance->clock_out?->format('H:i:s') ?? '',
                $attendance->total_hours ?? 0,
                $attendance->status,
            ];
        }

        return $csv;
    }

    private function generateSummary($attendances): array
    {
        return [
            'total_records' => $attendances->count(),
            'total_hours' => $attendances->sum('total_hours'),
            'late_count' => $attendances->where('status', 'late')->count(),
            'present_count' => $attendances->where('status', 'present')->count(),
            'by_employee' => $attendances->groupBy('user_id')->map(function ($records, $userId) {
                $user = $records->first()->user;
                return [
                    'user_id' => $userId,
                    'name' => $user->name,
                    'total_hours' => $records->sum('total_hours'),
                    'late_count' => $records->where('status', 'late')->count(),
                    'days_worked' => $records->count(),
                ];
            })->values(),
        ];
    }
}