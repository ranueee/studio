
'use client';

import { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// You must add your Mapbox access token to your .env file
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function MapboxMap() {
  const [viewState, setViewState] = useState({
    longitude: -74.5,
    latitude: 40,
    zoom: 9
  });

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4 bg-red-900/20 text-red-200 rounded-lg">
        <div className="max-w-md">
            <h2 className="font-bold text-lg text-white">Map Configuration Error</h2>
            <p className="mt-2 text-sm">Could not load Mapbox. Please add your access token.</p>
            <ul className="text-xs list-disc list-inside text-left mt-2 space-y-1">
                <li>Ensure `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set in your `.env` file.</li>
                <li>Verify the token is correct and has the required scopes enabled in your Mapbox account.</li>
            </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {/* You can add markers here */}
        <Marker longitude={-74.5} latitude={40} anchor="bottom" />
      </Map>
    </div>
  );
}

    