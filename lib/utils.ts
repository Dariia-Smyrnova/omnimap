import { EnrichedPlace } from "@/app/components/Enrichment";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchPlaces = async (
  query: string,
  location: {
    lat: number,
    lng: number
  },
  radius: number,
  placeType: string,
  total: number
): Promise<EnrichedPlace[]> => {
  let allResults: EnrichedPlace[] = [];
  console.log("fetching places");
  const service = new google.maps.places.PlacesService(
    document.createElement("div")
  );

  let request: google.maps.places.TextSearchRequest = {
    query: query,
    location: new google.maps.LatLng(location.lat, location.lng),
    radius: radius,
    type: placeType,
  };

  let isFinished = false;

  function callback(
    results: google.maps.places.PlaceResult[] | null,
    status: google.maps.places.PlacesServiceStatus,
    pagination: google.maps.places.PlaceSearchPagination | null
  ) {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      console.log("received results: ", results);
      allResults = allResults.concat(results as EnrichedPlace[]);
      if (pagination && pagination.hasNextPage && allResults.length < total) {
        setTimeout(() => {
          console.log("fetching next page");
          pagination.nextPage();
        }, 2000); // Wait for 2 seconds before next request
      } else {
        isFinished = true;
      }
    } else {
      console.log(new Error(`Places search failed: ${status}`));
      isFinished = true;
    }
  }

  service.textSearch(request, callback);
  while (!isFinished) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return allResults;
};