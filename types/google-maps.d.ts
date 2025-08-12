// Google Maps型定義（ビルドエラー回避用）
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: any)
    }
    
    class DirectionsService {
      route(request: any, callback: (result: any, status: any) => void): void
    }
    
    class DirectionsRenderer {
      setDirections(directions: any): void
      setMap(map: Map | null): void
    }
    
    class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
    }
    
    class Marker {
      constructor(opts: any)
      setMap(map: Map | null): void
    }
    
    class InfoWindow {
      constructor(opts?: any)
      open(map?: Map, anchor?: Marker): void
      close(): void
    }
    
    interface DirectionsRoute {
      legs: any[]
      overview_path: any[]
    }
    
    interface DirectionsResult {
      routes: DirectionsRoute[]
    }
    
    interface DirectionsRequest {
      origin: string
      destination: string
      travelMode: any
      language?: string
      avoidHighways?: boolean
      avoidTolls?: boolean
    }
    
    enum TravelMode {
      DRIVING = 'DRIVING'
    }
    
    enum DirectionsStatus {
      OK = 'OK'
    }
    
    namespace places {
      class PlacesService {
        constructor(attrContainer: Map | HTMLDivElement)
        nearbySearch(request: any, callback: (results: any, status: any) => void): void
        getDetails(request: any, callback: (result: any, status: any) => void): void
      }
      
      interface PlaceResult {
        place_id?: string
        name?: string
        vicinity?: string
        geometry?: {
          location: LatLng
        }
        types?: string[]
        rating?: number
      }
      
      interface PlaceSearchRequest {
        location: LatLng
        radius: number
        type?: string
        keyword?: string
      }
      
      enum PlacesServiceStatus {
        OK = 'OK'
      }
    }
  }
}