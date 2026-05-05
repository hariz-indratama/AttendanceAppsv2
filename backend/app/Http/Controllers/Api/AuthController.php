<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'employee',
            'hourly_rate' => 50.00,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        $refreshToken = $this->generateRefreshToken($user);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => $user,
                'token' => $token,
                'refresh_token' => $refreshToken,
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $refreshToken = $this->generateRefreshToken($user);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
                'refresh_token' => $refreshToken,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load('department');

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $user = User::where('refresh_token', $validated['refresh_token'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid refresh token',
            ], 401);
        }

        // Revoke old tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;
        $refreshToken = $this->generateRefreshToken($user);

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'refresh_token' => $refreshToken,
            ],
        ]);
    }

    private function generateRefreshToken(User $user): string
    {
        $token = Str::random(64);
        $user->update(['refresh_token' => $token]);
        return $token;
    }
}