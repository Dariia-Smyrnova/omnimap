"use client";
import { useCallback, useState } from "react";
import { env } from "../../env";
import { APIProvider, Map, MapEvent } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";

export function GoogleMap({
    appendLink,
}: {
    appendLink: (params: {link: string, lat: number, lng: number}) => void;
}) {
    const [position, setPosition] = useState<google.maps.LatLngLiteral>({
        lat: 53.54992,
        lng: 10.00678,
    });

    const addCurrentLocation = useCallback(() => {
        console.log(position);
        appendLink({ link: `https://www.google.com/maps?q=${position.lat},${position.lng}`, lat: position.lat, lng: position.lng });
    }, [position.lat, position.lng, appendLink]);

    const handleMapChange = (event: MapEvent) => {
        const center = event.map.getCenter()?.toJSON();
        setPosition(center!);
    };

    return (
        <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <Map
                style={{ width: "600px", height: "400px" }}
                defaultCenter={position}
                defaultZoom={10}
                onDragend={handleMapChange}
                onZoomChanged={handleMapChange}
            ></Map>
            <div className="flex flex-row justify-between items-center w-[600px] overflow-hidden">
                <div
                    className="text-left border border-gray-200 py-2 my-4 mr-2 rounded-lg truncate w-9/12 flex h-10  rounded-md  border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
      "
                >
                    {`https://www.google.com/maps?q=${position.lat},${position.lng}`}
                </div>

                <Button onClick={addCurrentLocation} className="w-3/12" type="button">
                    Add Current URL
                </Button>
            </div>
        </APIProvider>
    );
}
