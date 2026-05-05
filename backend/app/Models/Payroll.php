<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    use HasFactory;

    #[Fillable(['user_id', 'month', 'year', 'gross_salary', 'net_salary', 'total_hours', 'overtime_hours', 'hourly_rate', 'bonuses', 'deductions', 'late_deductions', 'status', 'processed_at', 'approved_by'])]

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'gross_salary' => 'decimal:2',
            'net_salary' => 'decimal:2',
            'total_hours' => 'decimal:2',
            'overtime_hours' => 'decimal:2',
            'hourly_rate' => 'decimal:2',
            'bonuses' => 'decimal:2',
            'deductions' => 'decimal:2',
            'late_deductions' => 'decimal:2',
            'processed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}