<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class PayrollException extends Exception
{
    public function __construct(string $message = 'Payroll calculation error', int $code = 422)
    {
        parent::__construct($message, $code);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => 'PAYROLL_ERROR',
        ], $this->getCode());
    }
}