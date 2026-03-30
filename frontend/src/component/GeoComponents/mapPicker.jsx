import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
// import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationMarker({ setCoords }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setCoords(e.latlng); 
      // optional chaining// send back to parent
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ center, setCoordinates }) {  // match CreateLand
  if (!center || !center.lat || !center.lng) {
    return <div className="h-[400px] flex items-center justify-center">
      Loading map...
    </div>;
  }

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-300 shadow-md relative">
  <MapContainer
    center={[center.lat, center.lng]}
    zoom={8}
    scrollWheelZoom={true}
    className="h-full w-full"
    zoomSnap={0.5}      // smoother zoom
    zoomDelta={0.5}     // smoother zoom steps
    doubleClickZoom={false} // optional: prevent zoom on double click
    dragging={true}         // allow dragging
  >
    <TileLayer
      attribution='© OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <LocationMarker setCoords={setCoordinates} />
  </MapContainer>

  {/* Optional: Overlay shadow or gradient to make it feel "framed" */}
  <div className="pointer-events-none absolute inset-0 rounded-xl shadow-inner"></div>
</div>
  );
}