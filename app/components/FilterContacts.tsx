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



const fetchPlaces = (query: string, location: string, radius: number, placeType: string) => {
    return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(document.createElement('div'));

        const [lat, lng] = location.split(',').map(Number);
        const request = {
            query: query,
            location: new google.maps.LatLng(lat, lng),
            radius: radius,
            type: placeType
        };

        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
            } else {
                reject(new Error(`Places search failed: ${status}`));
            }
        });
    });
};

export default function FilterContacts({ locations }: { locations: string[] }) {
    const [query, setQuery] = useState('');
    const [radius, setRadius] = useState(5);
    const [placeType, setPlaceType] = useState('roofing_contractor');
    const [places, setPlaces] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const placesPerPage = 10;
    const indexOfLastPlace = currentPage * placesPerPage;
    const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
    const currentPlaces = places.slice(indexOfFirstPlace, indexOfLastPlace);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const form = useForm({
        defaultValues: {
            query: "",
            radius: 1000,
            placeType: "",
        },
    });

    interface FilterFormData {
        query: string;
        radius: number;
        placeType: string;
    }

    const onSubmit = async (data: FilterFormData) => {
        try {
            for (const location of locations) {
                const results = await fetchPlaces(query, location, radius, placeType);
                setPlaces(prevPlaces => [...prevPlaces, ...results as any[]]);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Error fetching places:', error);
        }
    };

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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    <Button type="submit">Fetch Places</Button>
                </form>
            </Form>

            {places.length > 0 && (
                <div className="flex flex-col items-left justify-left w-full py-8">
                    <h3 className="text-2xl font-bold mb-4">Places</h3>
                    <ul className="divide-y divide-gray-200">
                        {currentPlaces.map((place, index) => (
                            <li key={index} className="flex items-center justify-between py-3">
                                {place.name} - {place.vicinity}
                            </li>
                        ))}
                    </ul>
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