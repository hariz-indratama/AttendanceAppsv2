<?php

namespace App\Services;

use App\Models\OfficeLocation;
use InvalidArgumentException;

class GeofenceService
{
    private const EARTH_RADIUS_METERS = 6371000;

    public function isWithinOffice(float $userLat, float $userLong, ?int $officeLocationId = null): bool
    {
        $office = $this->getOfficeLocation($officeLocationId);

        if ($office === null) {
            $office = $this->getDefaultOffice();
        }

        if ($office === null) {
            return false;
        }

        $distance = $this->calculateHaversineDistance(
            $userLat,
            $userLong,
            (float) $office->latitude,
            (float) $office->longitude
        );

        return $distance <= $office->radius_meters;
    }

    public function calculateHaversineDistance(
        float $lat1,
        float $long1,
        float $lat2,
        float $long2
    ): float {
        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $deltaLat = deg2rad($lat2 - $lat1);
        $deltaLong = deg2rad($long2 - $long1);

        $a = sin($deltaLat / 2) ** 2
            + cos($lat1Rad) * cos($lat2Rad) * sin($deltaLong / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return self::EARTH_RADIUS_METERS * $c;
    }

    public function getDistanceToOffice(float $userLat, float $userLong, ?int $officeLocationId = null): float
    {
        $office = $this->getOfficeLocation($officeLocationId) ?? $this->getDefaultOffice();

        if ($office === null) {
            throw new InvalidArgumentException('No office location configured');
        }

        return $this->calculateHaversineDistance(
            $userLat,
            $userLong,
            (float) $office->latitude,
            (float) $office->longitude
        );
    }

    private function getOfficeLocation(?int $id): ?OfficeLocation
    {
        if ($id === null) {
            return null;
        }

        return OfficeLocation::find($id);
    }

    private function getDefaultOffice(): ?OfficeLocation
    {
        return OfficeLocation::where('is_active', true)->first();
    }
}