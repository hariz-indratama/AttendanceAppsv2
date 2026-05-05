<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 30), 100);
        $userId = $request->input('user_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $status = $request->input('status');

        $query = Attendance::with(['user', 'officeLocation']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($startDate) {
            $query->whereDate('clock_in', '>=', Carbon::parse($startDate));
        }

        if ($endDate) {
            $query->whereDate('clock_in', '<=', Carbon::parse($endDate));
        }

        if ($status) {
            $query->where('status', $status);
        }

        $attendances = $query->orderBy('clock_in', 'desc')->paginate($perPage);

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

    public function update(Request $request, int $id): JsonResponse
    {
        $attendance = Attendance::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:present,late,absent,half_day',
            'notes' => 'nullable|string|max:500',
        ]);

        $attendance->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Attendance updated successfully',
            'data' => $attendance->fresh(['user', 'officeLocation']),
        ]);
    }
}