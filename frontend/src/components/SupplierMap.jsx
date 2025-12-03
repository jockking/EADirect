import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

// Geocode addresses to coordinates (for known suppliers)
const geocodeAddress = (address) => {
  if (!address) return null

  const addressMap = {
    // Microsoft - Redmond, WA
    'One Microsoft Way, Redmond, WA 98052, USA': [47.6423, -122.1390],
    // AWS - Seattle, WA
    '410 Terry Avenue North, Seattle, WA 98109, USA': [47.6205, -122.3493],
    // Red Hat - Raleigh, NC
    '100 East Davie Street, Raleigh, NC 27601, USA': [35.7796, -78.6382],
    // Oracle - Austin, TX
    '2300 Oracle Way, Austin, TX 78741, USA': [30.2672, -97.7431],
    // Atlassian - Sydney, Australia
    'Level 6, 341 George Street, Sydney NSW 2000, Australia': [-33.8688, 151.2093]
  }

  // Check for exact match first
  if (addressMap[address]) {
    return addressMap[address]
  }

  // Fallback: Simple city/country based geocoding for common locations
  const addressLower = address.toLowerCase()

  // Switzerland locations
  if (addressLower.includes('zurich') || addressLower.includes('zürich')) {
    return [47.3769, 8.5417] // Zurich city center
  }
  if (addressLower.includes('geneva') || addressLower.includes('genève')) {
    return [46.2044, 6.1432] // Geneva
  }
  if (addressLower.includes('bern') || addressLower.includes('berne')) {
    return [46.9480, 7.4474] // Bern
  }
  if (addressLower.includes('basel')) {
    return [47.5596, 7.5886] // Basel
  }

  // UK locations
  if (addressLower.includes('london')) {
    return [51.5074, -0.1278] // London
  }

  // Germany locations
  if (addressLower.includes('munich') || addressLower.includes('münchen')) {
    return [48.1351, 11.5820] // Munich
  }
  if (addressLower.includes('berlin')) {
    return [52.5200, 13.4050] // Berlin
  }
  if (addressLower.includes('frankfurt')) {
    return [50.1109, 8.6821] // Frankfurt
  }

  // France locations
  if (addressLower.includes('paris')) {
    return [48.8566, 2.3522] // Paris
  }

  // Netherlands locations
  if (addressLower.includes('amsterdam')) {
    return [52.3676, 4.9041] // Amsterdam
  }

  // More US locations
  if (addressLower.includes('new york') || addressLower.includes('nyc')) {
    return [40.7128, -74.0060] // New York
  }
  if (addressLower.includes('san francisco')) {
    return [37.7749, -122.4194] // San Francisco
  }
  if (addressLower.includes('los angeles')) {
    return [34.0522, -118.2437] // Los Angeles
  }
  if (addressLower.includes('chicago')) {
    return [41.8781, -87.6298] // Chicago
  }
  if (addressLower.includes('boston')) {
    return [42.3601, -71.0589] // Boston
  }

  // Asia-Pacific locations
  if (addressLower.includes('tokyo')) {
    return [35.6762, 139.6503] // Tokyo
  }
  if (addressLower.includes('singapore')) {
    return [1.3521, 103.8198] // Singapore
  }
  if (addressLower.includes('hong kong')) {
    return [22.3193, 114.1694] // Hong Kong
  }

  return null
}

function SupplierMap({ suppliers }) {
  // Filter suppliers with addresses and geocode them
  const suppliersWithCoords = suppliers
    .filter(s => s.address)
    .map(s => ({
      ...s,
      coords: geocodeAddress(s.address)
    }))
    .filter(s => s.coords)

  if (suppliersWithCoords.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#666',
        background: '#f8f9fa',
        borderRadius: '4px'
      }}>
        No supplier locations to display. Add addresses to suppliers to see them on the map.
      </div>
    )
  }

  // Calculate center and zoom based on supplier locations
  const calculateMapCenter = () => {
    if (suppliersWithCoords.length === 1) {
      return { center: suppliersWithCoords[0].coords, zoom: 10 }
    }

    // Calculate average position
    const avgLat = suppliersWithCoords.reduce((sum, s) => sum + s.coords[0], 0) / suppliersWithCoords.length
    const avgLng = suppliersWithCoords.reduce((sum, s) => sum + s.coords[1], 0) / suppliersWithCoords.length

    // For global view with suppliers on multiple continents, use lower zoom
    return { center: [avgLat, avgLng], zoom: 2 }
  }

  const { center, zoom } = calculateMapCenter()

  // Generate a key based on supplier IDs to force map re-render when suppliers change
  const mapKey = suppliersWithCoords.map(s => s.id).sort().join('-')

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '4px', overflow: 'hidden' }}>
      <MapContainer
        key={mapKey}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {suppliersWithCoords.map(supplier => (
          <Marker key={supplier.id} position={supplier.coords}>
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <strong style={{ fontSize: '1.1em', display: 'block', marginBottom: '0.5rem' }}>
                  {supplier.name}
                </strong>
                <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '0.5rem' }}>
                  {supplier.address}
                </div>
                {supplier.website && (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.85em', color: '#64748b' }}
                  >
                    Visit website →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default SupplierMap
