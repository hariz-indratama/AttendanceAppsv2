export interface GeofenceLocation {
  office_id: number
  name: string
  latitude: number
  longitude: number
  radius_meters: number
}

export interface GeofenceCheckResult {
  is_within_range: boolean
  distance_meters: number
  office_name: string
}
