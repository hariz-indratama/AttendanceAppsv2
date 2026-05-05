This guide details the implementation of **Geofencing** and **WebAuthn** for your attendance application. [cite_start]By utilizing a **decoupled MVC architecture**, we maintain industry-grade security where the **Laravel API** handles verification logic and the **Vue 3 PWA** manages user interaction[cite: 22, 54, 146].

---

## 1. Geofencing Implementation Guide

[cite_start]Geofencing ensures employees are physically at the office before a clock-in is recorded[cite: 17, 114, 140].

### A. Backend: Geofence Service (`app/Services/GeofenceService.php`)

[cite_start]The service layer calculates the distance between the employee's GPS coordinates and the office location using the Haversine formula[cite: 128, 152].

```php
namespace App\Services;

class GeofenceService
{
    public function verifyLocation(float $userLat, float $userLong, float $officeLat, float $officeLong, int $radius = 100): bool
    {
        $earthRadius = 6371000; // Meters

        $dLat = deg2rad($officeLat - $userLat);
        $dLon = deg2rad($officeLong - $userLong);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($userLat)) * cos(deg2rad($officeLat)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return $distance <= $radius; [cite_start]// Returns true if within the 100m radius [cite: 114, 140, 156]
    }
}
```

### B. Controller Logic (`app/Http/Controllers/Api/AttendanceController.php`)

[cite_start]The controller injects the service to validate the request before data entry[cite: 124, 151].

```php
public function clockIn(Request $request, GeofenceService $geofence)
{
    $request->validate(['lat' => 'required|numeric', 'long' => 'required|numeric']);

    $isAtOffice = $geofence->verifyLocation(
        $request->lat, $request->long,
        config('office.latitude'), config('office.longitude')
    );

    if (!$isAtOffice) {
        return response()->json(['error' => 'Out of office radius'], 403);
    }

    [cite_start]// Proceed with clock-in logic [cite: 124, 156]
}
```

---

## 2. WebAuthn (Biometrics) Guide

[cite_start]WebAuthn allows secure, non-transferable authentication via FaceID or Fingerprint on mobile devices[cite: 18, 49, 138, 164].

### A. Registration Flow (Backend & Frontend)

1.  [cite_start]**Challenge Generation**: The Laravel backend generates a unique cryptographic challenge[cite: 125].
2.  [cite_start]**Credential Creation**: The Vue PWA uses the `navigator.credentials.create()` API to prompt for biometrics[cite: 138, 164].
3.  [cite_start]**Verification**: The backend verifies the signed response and stores the Public Key associated with the `User` model[cite: 111, 150].

### B. Frontend: PWA Component (`ClockIn.vue`)

[cite_start]Using `@simplewebauthn/browser` for a streamlined implementation in the Vue View layer[cite: 130, 136, 143].

```javascript
import { startRegistration } from "@simplewebauthn/browser";

const registerBiometrics = async () => {
  [cite_start]; // 1. Get options from Laravel API [cite: 131, 148]
  const options = await axios.get("/api/webauthn/register-options");

  [cite_start]; // 2. Trigger native FaceID/Fingerprint prompt [cite: 138, 164]
  const attestationResponse = await startRegistration(options.data);

  [cite_start]; // 3. Send response back for backend verification [cite: 106, 116]
  await axios.post("/api/webauthn/register", attestationResponse);
};
```

### C. Security Standards for 2026

- [cite_start]**Non-Transferable**: Unlike passwords, biometric credentials stay on the device Secure Enclave and cannot be shared between employees[cite: 138, 164].
- [cite_start]**Sanctum Integration**: Once verified, the API issues a standard Sanctum token for subsequent requests[cite: 139, 163].

---

## 3. Integrated Security Infrastructure

For a robust production environment, the following standards are combined:

| Layer                | Component       | Security Role                                                                                           |
| :------------------- | :-------------- | :------------------------------------------------------------------------------------------------------ |
| **PWA (View)**       | Geolocation API | [cite_start]Captures precise user coordinates for geofencing[cite: 45, 154].                            |
| **API (Controller)** | GeofenceService | [cite_start]Prevents fraudulent clock-ins from remote locations[cite: 114, 152, 156].                   |
| **Auth (Model)**     | WebAuthn Keys   | [cite_start]Links physical identity (biometrics) to the User model[cite: 49, 118, 164].                 |
| **Real-time**        | Laravel Reverb  | [cite_start]Alerts admins instantly if a secure check fails or an employee is late[cite: 50, 117, 165]. |
