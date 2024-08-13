"use client"
import { useEffect, useState } from 'react';
import { env } from '../../env';
import { APIProvider, Map, MapEvent, Marker } from '@vis.gl/react-google-maps';
import { useAtom } from 'jotai';
import { mapLinksAtom } from './MapLinks'; // Make sure to export mapLinksAtom from MapLinks.tsx
import { Button } from '@/components/ui/button';

export function GoogleMap() {
    const [mapLinks, setMapLinks] = useAtom(mapLinksAtom);
    const [map, setMap] = useState(null);
    const [position, setPosition] = useState<google.maps.LatLngLiteral>({ lat: 53.54992, lng: 10.00678 });

    const addCurrentLocation = () => {
        const url = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
        setMapLinks((links) => [...links, { url }]);
    };


    return (
        <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <Map
                defaultCenter={position}
                defaultZoom={10}
                
                // center={position}
                onDragend={(event: MapEvent) => {
                    const center = event.map.getCenter()?.toJSON();
                    setPosition(center!);
                }}
            >
            </Map>
            <Button onClick={addCurrentLocation}>Add Current Location to List</Button>
        </APIProvider>
    );
}
