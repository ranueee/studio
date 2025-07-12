
'use client';

import { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// You must add your Mapbox access token to your .env file
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function MapboxMap() {
  const [viewState, setViewState] = useState({
    longitude: 120.2315,
    latitude: 16.0217,
    zoom: 10
  });

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4 bg-red-900/20 text-red-200 rounded-lg">
        <div className="max-w-md">
            <h2 className="font-bold text-lg text-white">Map Configuration Error</h2>
            <p className="mt-2 text-sm">Could not load Mapbox. Please add your access token.</p>
            <ul className="text-xs list-disc list-inside text-left mt-2 space-y-1">
                <li>Create or open the `.env` file in the root of your project.</li>
                <li>Add the following line: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN='your_token_here'`</li>
                <li>Replace `'your_token_here'` with your actual token from mapbox.com.</li>
                <li>Restart your development server to apply the changes.</li>
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
        <Marker longitude={120.2315} latitude={16.0217} anchor="bottom" />
      </Map>
    </div>
  );
}
