<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OfficeLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $office = OfficeLocation::where('is_active', true)->first();

        return response()->json([
            'data' => [
                'company_name' => config('app.name'),
                'latitude' => $office?->latitude,
                'longitude' => $office?->longitude,
                'radius_meters' => $office?->radius_meters ?? 100,
                'work_start' => $office?->default_start_time ?? '09:00',
                'work_end' => $office?->default_end_time ?? '18:00',
                'office_name' => $office?->name ?? '',
                'office_address' => $office?->address ?? '',
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius_meters' => ['required', 'integer', 'between:10,2000'],
            'work_start' => ['required', 'date_format:H:i'],
            'work_end' => ['required', 'date_format:H:i', 'after:work_start'],
            'office_name' => ['nullable', 'string', 'max:255'],
            'office_address' => ['nullable', 'string', 'max:500'],
            'company_name' => ['nullable', 'string', 'max:255'],
        ]);

        // Deactivate all existing offices
        OfficeLocation::where('is_active', true)->update(['is_active' => false]);

        // Create or update the primary office
        $office = OfficeLocation::create([
            'name' => $validated['office_name'] ?? 'Head Office',
            'address' => $validated['office_address'] ?? '',
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'radius_meters' => $validated['radius_meters'],
            'default_start_time' => $validated['work_start'],
            'default_end_time' => $validated['work_end'],
            'is_active' => true,
        ]);

        // Update company name in config
        if (!empty($validated['company_name'])) {
            config(['app.name' => $validated['company_name']]);
        }

        return response()->json([
            'message' => 'Settings saved successfully.',
            'data' => [
                'latitude' => $office->latitude,
                'longitude' => $office->longitude,
                'radius_meters' => $office->radius_meters,
                'work_start' => $office->default_start_time,
                'work_end' => $office->default_end_time,
                'office_name' => $office->name,
                'office_address' => $office->address,
            ],
        ]);
    }
}