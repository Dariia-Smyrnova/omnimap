export interface EnrichedPlace extends google.maps.places.PlaceResult {
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
}

export const enrichPlace = (
    place: google.maps.places.PlaceResult
): Promise<EnrichedPlace> => {
    return new Promise((resolve) => {
        const service = new google.maps.places.PlacesService(
            document.createElement("div")
        );

        const request: google.maps.places.PlaceDetailsRequest = {
            placeId: place.place_id as string,
            fields: [
                "name",
                "formatted_phone_number",
                "international_phone_number",
                "website",
            ],
        };

        service.getDetails(request, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && details) {
                resolve({
                    ...place,
                    formatted_phone_number: details.formatted_phone_number,
                    international_phone_number: details.international_phone_number
                        ? details.international_phone_number.replace(/\s/g, "")
                        : undefined,
                    website: details.website,
                });
            } else {
                resolve(place as EnrichedPlace);
            }
        });
    });
};

