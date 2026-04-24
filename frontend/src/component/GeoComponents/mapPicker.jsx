import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to update map center & zoom
function MapUpdater({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Marker click component
function LocationMarker({ position, setCoords }) {
  useMapEvents({
    click(e) {
      setCoords(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ center, setCoordinates }) {
  const [markerPos, setMarkerPos] = useState(null);

  useEffect(() => {
    setMarkerPos(null); // reset marker when center changes
  }, [center]);

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-300 shadow-md relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={8} // initial zoom
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Update map when center changes */}
        <MapUpdater center={center} zoom={12} />

        <LocationMarker
          position={markerPos}
          setCoords={(latlng) => {
            setMarkerPos(latlng);
            setCoordinates(latlng);
          }}
        />
      </MapContainer>
    </div>
  );
}
