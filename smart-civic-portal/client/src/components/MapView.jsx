import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const defaultCenter = [28.6139, 77.209]; // [lat, lng] for Leaflet

// Component to handle map center updates
const MapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapView = ({ markers = [], height = '420px' }) => {
  const mapRef = useRef(null);

  const center =
    markers.length > 0
      ? [Number(markers[0].latitude || markers[0].lat), Number(markers[0].longitude || markers[0].lng)]
      : defaultCenter;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter center={center} />
        {markers.map((marker) => {
          const position = [
            Number(marker.latitude || marker.lat),
            Number(marker.longitude || marker.lng),
          ];
          return (
            <Marker key={marker._id || `${marker.lat}-${marker.lng}`} position={position}>
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-slate-900">
                    {marker.issueTitle || marker.title || 'Complaint Location'}
                  </h4>
                  {marker.description && (
                    <p className="mt-1 text-sm text-slate-600">{marker.description}</p>
                  )}
                  {marker.status && (
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        marker.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : marker.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {marker.status}
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;

