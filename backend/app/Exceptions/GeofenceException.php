<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class GeofenceException extends Exception
{
    private float $distance;
    private float $allowedRadius;

    public function __construct(float $distance, float $allowedRadius, string $message = 'Outside office geofence')
    {
        parent::__construct($message, 403);
        $this->distance = $distance;
        $this->allowedRadius = $allowedRadius;
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => 'GEOFENCE_VIOLATION',
            'distance' => round($this->distance, 2),
            'allowed_radius' => $this->allowedRadius,
        ], 403);
    }
}