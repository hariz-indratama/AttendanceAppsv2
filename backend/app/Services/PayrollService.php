<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PayrollService
{
    private const OVERTIME_THRESHOLD_HOURS = 160;
    private const OVERTIME_MULTIPLIER = 1.5;
    private const LATE_THRESHOLD_MINUTES = 30;
    private const LATE_DEDUCTION_RATE = 0.5;

    public function calculateMonthlyPayroll(User $user, int $month, int $year): array
    {
        $attendances = $this->getMonthlyAttendances($user->id, $month, $year);
        $hourlyRate = $user->hourly_rate ?? $this->getDefaultHourlyRate();

        $totalHours = $this->calculateTotalHours($attendances);
        $overtimeHours = $this->calculateOvertimeHours($totalHours);
        $lateDeductions = $this->calculateLateDeductions($attendances);

        $grossSalary = $this->calculateGrossSalary($totalHours, $overtimeHours, $hourlyRate);
        $netSalary = $grossSalary - $lateDeductions;

        return [
            'user_id' => $user->id,
            'month' => $month,
            'year' => $year,
            'hourly_rate' => $hourlyRate,
            'total_hours' => round($totalHours, 2),
            'overtime_hours' => round($overtimeHours, 2),
            'gross_salary' => round($grossSalary, 2),
            'bonuses' => 0.00,
            'deductions' => round($lateDeductions, 2),
            'late_deductions' => round($lateDeductions, 2),
            'net_salary' => round($netSalary, 2),
            'status' => 'draft',
        ];
    }

    public function generatePayrollForMonth(int $month, int $year): Collection
    {
        $users = User::where('role', 'employee')->get();
        $results = collect();

        foreach ($users as $user) {
            $payrollData = $this->calculateMonthlyPayroll($user, $month, $year);

            $payroll = Payroll::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'month' => $month,
                    'year' => $year,
                ],
                $payrollData
            );

            $results->push($payroll);
        }

        return $results;
    }

    private function getMonthlyAttendances(int $userId, int $month, int $year): Collection
    {
        return Attendance::where('user_id', $userId)
            ->whereYear('clock_in', $year)
            ->whereMonth('clock_in', $month)
            ->whereNotNull('clock_out')
            ->get();
    }

    private function calculateTotalHours(Collection $attendances): float
    {
        $totalMinutes = 0;

        foreach ($attendances as $attendance) {
            if ($attendance->clock_in && $attendance->clock_out) {
                $totalMinutes += $attendance->clock_in->diffInMinutes($attendance->clock_out);
            }
        }

        return $totalMinutes / 60;
    }

    private function calculateOvertimeHours(float $totalHours): float
    {
        if ($totalHours <= self::OVERTIME_THRESHOLD_HOURS) {
            return 0;
        }

        return $totalHours - self::OVERTIME_THRESHOLD_HOURS;
    }

    private function calculateGrossSalary(float $totalHours, float $overtimeHours, float $hourlyRate): float
    {
        $regularHours = $totalHours - $overtimeHours;
        $regularPay = $regularHours * $hourlyRate;
        $overtimePay = $overtimeHours * $hourlyRate * self::OVERTIME_MULTIPLIER;

        return $regularPay + $overtimePay;
    }

    private function calculateLateDeductions(Collection $attendances): float
    {
        $totalDeduction = 0;

        foreach ($attendances as $attendance) {
            if ($attendance->status === 'late') {
                $totalDeduction += self::LATE_DEDUCTION_RATE;
            }
        }

        return $totalDeduction;
    }

    private function getDefaultHourlyRate(): float
    {
        return 50.00;
    }
}