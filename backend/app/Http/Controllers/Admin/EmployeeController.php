<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 20), 100);
        $search = $request->input('search');
        $departmentId = $request->input('department_id');

        $query = User::with('department')->where('role', 'employee');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $employees = $query->orderBy('name')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $employees->items(),
            'meta' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'hourly_rate' => 'nullable|numeric|min:0',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $employee = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'employee',
            'hourly_rate' => $validated['hourly_rate'] ?? 50.00,
            'department_id' => $validated['department_id'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employee created successfully',
            'data' => $employee->load('department'),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $employee = User::with('department')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $employee,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $employee = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'nullable|min:8|confirmed',
            'hourly_rate' => 'nullable|numeric|min:0',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $employee->fill($validated);

        if (isset($validated['password'])) {
            $employee->password = Hash::make($validated['password']);
        }

        $employee->save();

        return response()->json([
            'success' => true,
            'message' => 'Employee updated successfully',
            'data' => $employee->load('department'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $employee = User::findOrFail($id);
        $employee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Employee deleted successfully',
        ]);
    }
}