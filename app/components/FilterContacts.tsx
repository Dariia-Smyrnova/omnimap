// Function to call the Google Places API

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { env } from "../../env";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { placesTypes } from "../data/Places";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { atom, useAtom } from 'jotai';
import { Loader2 } from "lucide-react";

export const placesAtom = atom<EnrichedPlace[]>([]);

interface EnrichedPlace extends google.maps.places.PlaceResult {
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
}

const enrichPlace = (place: google.maps.places.PlaceResult): Promise<EnrichedPlace> => {
    return new Promise((resolve) => {
        const service = new google.maps.places.PlacesService(document.createElement('div'));

        const request: google.maps.places.PlaceDetailsRequest = {
            placeId: place.place_id as string,
            fields: ['name', 'formatted_phone_number', 'international_phone_number', 'website']
        };

        service.getDetails(request, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && details) {
                resolve({
                    ...place,
                    formatted_phone_number: details.formatted_phone_number,
                    international_phone_number: details.international_phone_number ? details.international_phone_number.replace(/\s/g, '') : undefined,
                    website: details.website
                });
            } else {
                resolve(place as EnrichedPlace);
            }
        });
    });
};


const fetchPlaces = async (query: string, location: string, radius: number, placeType: string, total: number): Promise<EnrichedPlace[]> => {
    let allResults: EnrichedPlace[] = [];
    console.log('fetching places');
    const service = new google.maps.places.PlacesService(document.createElement('div'));

    const [lat, lng] = location.split(',').map(Number);

    let request: google.maps.places.TextSearchRequest = {
        query: query,
        location: new google.maps.LatLng(lat, lng),
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
            console.log('received results: ', results);
            allResults = allResults.concat(results as EnrichedPlace[]);
            if (pagination && pagination.hasNextPage) {
                setTimeout(() => {
                    console.log('fetching next page');
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
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Perform enrichment after all results are collected
    // const enrichedResults = await Promise.all(allResults.map(result => enrichPlace(result)));
    return allResults;
};

export default function FilterContacts({ locations }: { locations: string[] }) {
    const [places, setPlaces] = useAtom(placesAtom);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const placesPerPage = 10;
    const indexOfLastPlace = currentPage * placesPerPage;
    const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
    const currentPlaces = places.slice(indexOfFirstPlace, indexOfLastPlace);

    const enrichCurrentPlaces = async () => {
        setIsLoading(true);
        try {
            const enrichedPlaces = await Promise.all(places.map(place => enrichPlace(place)));
            setPlaces(enrichedPlaces);
        } catch (error) {
            console.error('Error enriching places:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const form = useForm({
        defaultValues: {
            query: "",
            radius: 30000,
            placeType: "",
        },
    });

    interface FilterFormData {
        query: string;
        radius: number;
        placeType: string;
        amount: number;
    }

    const onSubmit = async (data: FilterFormData) => {
        if (locations.length === 0) {
            alert("Please add Google Map links to retrieve data from.");
        } else {
            setIsLoading(true);
            try {
                for (const location of locations) {
                    const results = await fetchPlaces(data.query, location, data.radius, data.placeType, data.amount);
                    setPlaces(prevPlaces => [...prevPlaces, ...results as any[]]);
                    setCurrentPage(1);
                }
            } catch (error) {
                console.error('Error fetching places:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };
    // const fetchButton = document.getElementById('fetchButton');
    // fetchButton.addEventListener('click', handleButtonClick);

    // function handleButtonClick(event) {
    //     if (locations.length === 0) {
    //       event.preventDefault();
    //       showPopup("Please add Google Map links to retrieve data from.");
    //     } else {
    //       // Your existing button click logic here
    //     }
    //   }

    //   function showPopup(message) {
    //     // You can use a library like SweetAlert2 or create your own popup
    //     // Here's a simple example using the built-in alert function
    //     alert(message);

    //     // If you want a more stylish popup, you could create a custom one:
    //     /*
    //     const popup = document.createElement('div');
    //     popup.classList.add('popup');
    //     popup.textContent = message;
    //     document.body.appendChild(popup);
    //     setTimeout(() => {
    //       popup.remove();
    //     }, 3000); // Remove after 3 seconds
    //     */
    //   }

    const totalPages = Math.ceil(places.length / placesPerPage);

    return (
        <section className="flex flex-col items-center justify-center w-full py-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                    <FormField
                        control={form.control}
                        name="query"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Search Query</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Enter search query" {...field} />
                                </FormControl>
                                <FormDescription>Enter your search query for places</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="radius"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Radius (meters)</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" placeholder="Enter radius" {...field} />
                                </FormControl>
                                <FormDescription>Specify the search radius in meters</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="placeType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Place Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} required>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a place type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {placesTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Specify the type of place you're looking for</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        defaultValue={100}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Specify the amount (default is 100)</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isLoading} id="fetchButton">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Fetching Places...
                            </>
                        ) : (
                            'Fetch Places'
                        )}
                    </Button>
                </form>
            </Form>

            {places.length > 0 && (
                <div className="flex flex-col items-left justify-left w-full py-8">
                    <h3 className="text-2xl font-bold mb-4">Places</h3>
                    <ul className="divide-y divide-gray-200">

                        {currentPlaces
                            // .filter(place => place.international_phone_number)
                            .map((place, index) => (
                                <li key={index} className="flex items-center justify-between py-3">
                                    <div>
                                        <span className="font-bold">{place.name}</span>
                                        {place.formatted_phone_number && (
                                            <span className="ml-2">{place.formatted_phone_number}</span>
                                        )}
                                        {place.website && (
                                            <a href={place.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500">
                                                Website
                                            </a>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newPlaces = [...places];
                                            newPlaces.splice(indexOfFirstPlace + index, 1);
                                            setPlaces(newPlaces);
                                        }}
                                    >
                                        ×
                                    </Button>
                                </li>
                            ))}
                    </ul>
                    <Button
                        onClick={enrichCurrentPlaces}
                        disabled={isLoading}
                        className="mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enriching Results...
                            </>
                        ) : (
                            'Enrich Results'
                        )}
                    </Button>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => paginate(currentPage - 1)}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        onClick={() => paginate(i + 1)}
                                        isActive={currentPage === i + 1}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => paginate(currentPage + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <script src={`https://maps.googleapis.com/maps/api/js?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}></script>

        </section>
    );
}