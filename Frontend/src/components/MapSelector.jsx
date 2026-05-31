import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

// Bounding box for India
const indiaBounds = L.latLngBounds(
  L.latLng(6.4626999, 68.1097), // South west
  L.latLng(35.513327, 97.395358) // North east
);

const MapSelector = ({ onLocationSelect, mapCenter }) => {
  // Default to a central location, e.g., New Delhi
  const defaultCenter = [28.6139, 77.2090];
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (mapCenter) {
      setPosition(mapCenter);
    }
  }, [mapCenter]);

  useEffect(() => {
    if (position) {
      onLocationSelect(position);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner z-0 relative group">
      <MapContainer 
        center={defaultCenter} 
        zoom={10} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
        minZoom={5}
      >
        <MapUpdater center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      {!position && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-slate-200 z-[1000] text-sm font-medium text-slate-700 pointer-events-none transition-opacity duration-300 group-hover:opacity-100">
          Click on the map to pin a location
        </div>
      )}
    </div>
  );
};

export default MapSelector;
