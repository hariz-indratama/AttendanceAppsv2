<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function __construct(
        private readonly PayrollService $payrollService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 30), 100);
        $userId = $request->input('user_id');
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $status = $request->input('status');

        $query = Payroll::with('user');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->where('month', $month)->where('year', $year);

        if ($status) {
            $query->where('status', $status);
        }

        $payrolls = $query->orderBy('user_id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $payrolls->items(),
            'meta' => [
                'current_page' => $payrolls->currentPage(),
                'last_page' => $payrolls->lastPage(),
                'per_page' => $payrolls->perPage(),
                'total' => $payrolls->total(),
            ],
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020|max:2100',
        ]);

        $results = $this->payrollService->generatePayrollForMonth(
            $validated['month'],
            $validated['year']
        );

        return response()->json([
            'success' => true,
            'message' => "Payroll generated for {$validated['month']}/{$validated['year']}",
            'data' => [
                'processed' => $results->count(),
                'payrolls' => $results->load('user'),
            ],
        ]);
    }
}