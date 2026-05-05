<?php

namespace Database\Seeders;

use App\Models\OfficeLocation;
use Illuminate\Database\Seeder;

class OfficeLocationSeeder extends Seeder
{
    public function run(): void
    {
        OfficeLocation::updateOrCreate(
            ['is_active' => true],
            [
                'name' => 'Head Office',
                'address' => 'Jakarta, Indonesia',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'radius_meters' => 100,
                'default_start_time' => '09:00',
                'default_end_time' => '18:00',
                'is_active' => true,
            ]
        );
    }
}