<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\OfficeLocation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Departments (idempotent)
        $it = Department::firstOrCreate(['code' => 'IT'], [
            'name' => 'Information Technology',
            'description' => 'IT Department',
        ]);

        $hr = Department::firstOrCreate(['code' => 'HR'], [
            'name' => 'Human Resources',
            'description' => 'HR Department',
        ]);

        $finance = Department::firstOrCreate(['code' => 'FIN'], [
            'name' => 'Finance',
            'description' => 'Finance Department',
        ]);

        // Create Office Location (idempotent)
        $hq = OfficeLocation::firstOrCreate(
            ['name' => 'Headquarters'],
            [
                'address' => '123 Business Center, Jakarta',
                'latitude' => -6.208764,
                'longitude' => 106.845599,
                'radius_meters' => 100,
                'default_start_time' => '08:00:00',
                'default_end_time' => '17:00:00',
            ]
        );

        // Create Admin User (idempotent)
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'department_id' => $hr->id,
                'hourly_rate' => 150000,
            ]
        );

        // Create Employee Users
        $employees = [
            [
                'name' => 'John Smith',
                'email' => 'john.smith@example.com',
                'department' => $it,
                'hourly_rate' => 100000,
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'department' => $hr,
                'hourly_rate' => 85000,
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael.chen@example.com',
                'department' => $finance,
                'hourly_rate' => 95000,
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily.davis@example.com',
                'department' => $it,
                'hourly_rate' => 110000,
            ],
            [
                'name' => 'Robert Wilson',
                'email' => 'robert.wilson@example.com',
                'department' => $finance,
                'hourly_rate' => 90000,
            ],
        ];

        foreach ($employees as $empData) {
            $employee = User::firstOrCreate(
                ['email' => $empData['email']],
                [
                    'name' => $empData['name'],
                    'password' => Hash::make('password123'),
                    'role' => 'employee',
                    'department_id' => $empData['department']->id,
                    'hourly_rate' => $empData['hourly_rate'],
                ]
            );

            // Only generate attendance if user was just created
            if ($employee->wasRecentlyCreated) {
                $this->generateAttendance($employee, $hq);
            }
        }
    }

    private function generateAttendance(User $user, OfficeLocation $office): void
    {
        $today = Carbon::today();

        for ($i = 30; $i >= 0; $i--) {
            $date = $today->copy()->subDays($i);

            // Skip weekends
            if ($date->isWeekend()) {
                continue;
            }

            // Randomly determine if employee is absent (5% chance)
            if (rand(1, 100) > 95) {
                continue; // No attendance record for absent days
            }

            // Determine if late (20% chance)
            $isLate = rand(1, 100) <= 20;

            // Clock in between 7:30 - 9:30
            $clockInHour = $isLate ? rand(8, 9) : rand(7, 8);
            $clockInMinute = rand(0, 59);
            $clockIn = $date->copy()->setTime($clockInHour, $clockInMinute, 0);

            // Clock out between 17:00 - 19:00
            $clockOutHour = rand(17, 19);
            $clockOutMinute = rand(0, 59);
            $clockOut = $date->copy()->setTime($clockOutHour, $clockOutMinute, 0);

            // Calculate total hours
            $totalHours = $clockIn->diffInMinutes($clockOut) / 60;

            Attendance::create([
                'user_id' => $user->id,
                'office_location_id' => $office->id,
                'clock_in' => $clockIn,
                'clock_out' => $clockOut,
                'lat_in' => $office->latitude,
                'long_in' => $office->longitude,
                'lat_out' => $office->latitude,
                'long_out' => $office->longitude,
                'status' => $isLate ? 'late' : 'present',
                'total_hours' => round($totalHours, 2),
                'device_id' => 'SEED-' . substr(md5($user->id), 0, 8),
                'biometric_verified' => true,
                'notes' => null,
            ]);
        }
    }
}