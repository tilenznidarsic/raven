import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';

const TILE_LAYERS = {
  street: {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  },
  satellite: {
    attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  },
} as const;

type LatLng = {
  lat: number;
  lng: number;
};

type Waypoint = {
  id: string;
  name: string;
  position: LatLng;
  distanceKm: number;
  etaMinutes: number;
};

export type NavigationData = {
  dronePosition: LatLng;
  droneHeading: number;
  waypoints: Waypoint[];
};

type Props = {
  data: NavigationData;
};

const waypointIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:9999px;background:#38bdf8;border:1px solid black;"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function droneIcon(heading: number) {
  return L.divIcon({
    className: '',
    html: `<div style="transform:rotate(${heading}deg);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:16px solid #f97316;filter:drop-shadow(1px 0 0 black) drop-shadow(-1px 0 0 black) drop-shadow(0 1px 0 black) drop-shadow(0 -1px 0 black);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function RecenterButton({ center }: { center: LatLng }) {
  const map = useMap();

  return (
    <button
      type="button"
      onClick={() => map.setView([center.lat, center.lng], map.getZoom())}
      className="cursor-pointer border border-black bg-black/80 px-2 py-1 text-xs font-bold text-white"
    >
      Recenter
    </button>
  );
}

export default function NavigationPanel({ data }: Props) {
  const { dronePosition, droneHeading, waypoints } = data;
  const [tileLayer, setTileLayer] = useState<keyof typeof TILE_LAYERS>('street');
  const routePositions: [number, number][] = waypoints.map((waypoint) => [
    waypoint.position.lat,
    waypoint.position.lng,
  ]);
  const nextWaypoints = waypoints.slice(0, 3);

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl ${tileLayer === 'street' ? 'dark-map' : ''}`}
    >
      <MapContainer
        center={[dronePosition.lat, dronePosition.lng]}
        zoom={16}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          key={tileLayer}
          attribution={TILE_LAYERS[tileLayer].attribution}
          url={TILE_LAYERS[tileLayer].url}
        />
        <div className="absolute bottom-2 left-2 z-1000 flex flex-col gap-2">
          <RecenterButton center={dronePosition} />
          <button
            type="button"
            onClick={() =>
              setTileLayer((prev) => (prev === 'street' ? 'satellite' : 'street'))
            }
            className="cursor-pointer border border-black bg-black/80 px-2 py-1 text-xs font-bold text-white"
          >
            {tileLayer === 'street' ? 'Satellite' : 'Street'}
          </button>
        </div>
        {waypoints.length > 1 && (
          <Polyline positions={routePositions} color="#38bdf8" dashArray="4 4" />
        )}
        {waypoints.map((waypoint) => (
          <Marker
            key={waypoint.id}
            position={[waypoint.position.lat, waypoint.position.lng]}
            icon={waypointIcon}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -6]}
              className="waypoint-label"
            >
              {waypoint.name}
            </Tooltip>
          </Marker>
        ))}
        <Marker
          position={[dronePosition.lat, dronePosition.lng]}
          icon={droneIcon(droneHeading)}
        />
      </MapContainer>

      <div className="absolute right-2 bottom-2 z-1000 flex flex-col gap-1 border border-black bg-black/80 p-2 text-xs text-white">
        <span className="font-bold">Next waypoints</span>
        {nextWaypoints.map((waypoint) => (
          <div key={waypoint.id} className="flex items-center justify-between gap-4">
            <span>{waypoint.name}</span>
            <span>{waypoint.distanceKm.toFixed(1)} km</span>
            <span>{waypoint.etaMinutes} min</span>
          </div>
        ))}
      </div>
    </div>
  );
}
