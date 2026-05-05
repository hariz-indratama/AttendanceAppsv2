<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class AttendanceException extends Exception
{
    public function __construct(string $message = 'Attendance error', int $code = 422)
    {
        parent::__construct($message, $code);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => 'ATTENDANCE_ERROR',
        ], $this->getCode());
    }
}