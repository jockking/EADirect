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

  return addressMap[address] || null
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

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '4px', overflow: 'hidden' }}>
      <MapContainer
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
