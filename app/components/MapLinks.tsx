"use client";
import PlacesList, { placesAtom } from "./PlacesList";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
    FormLabel,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import SendMessage from "./SendMessage";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleMap } from "./Map";
import { useEffect, useState } from "react";
import { EnrichedPlace } from "./Enrichment";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { placesTypes } from "../data/Places";
import { Loader2 } from "lucide-react";
import { env } from "@/env";

// Interface for Google Places API response
interface PlacesApiResponse {
    results: any[];
    next_page_token?: string;
}

// Define the structure for a map link
interface MapLink {
    url: string;
}

// Create an atom to store the list of map links
export const mapLinksAtom = atomWithStorage<MapLink[]>("mapLinks", []);


// Create a derived atom to calculate statistics
const statsAtom = atom((get) => {
    const links = get(mapLinksAtom);
    return {
        totalLinks: links.length,
    };
});

const MapLinksItem = ({
    link,
    index,
    remove,
}: {
    link: MapLink;
    index: number;
    remove: (index: number) => void;
}) => {
    const form = useFormContext<SearchFormData>();

    return (
        <li className="flex items-center justify-between py-3">
            <FormField
                control={form.control}
                name={`mapLinks.${index}.url`}
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormControl>
                            <span>{field.value}</span>
                        </FormControl>
                        {/* <FormDescription>
              Enter a valid Google Maps URL to add to your list.
            </FormDescription> */}
                        {fieldState.error && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                        )}
                        <FormMessage />
                    </FormItem>
                )}
            />
            <button
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 focus:outline-none"
            >
                🗑️
            </button>
        </li>
    );
};

// Component to display the list of map links
const MapLinksList = () => {
    const form = useFormContext<SearchFormData>();

    const { fields, prepend, remove } = useFieldArray({
        control: form.control, // control props comes from useForm (optional: if you are using FormProvider)
        name: "mapLinks", // unique name for your Field Array
        rules: {
            minLength: 2,
        },
    });

    const [url, setUrl] = useState("");

    const handleAppend = () => {
        console.log(url);
        const regex = /(?:@|%40)?(?<latitude>[-]?\d+\.\d+),(?<longitude>[-]?\d+\.\d+)(?:,(?<zoom>\d+(?:\.\d+)?z))?/;
        const match = url.match(regex);
        console.log(match);
        if (match && match.groups) {
            const { latitude, longitude, zoom } = match.groups;
            prepend({ 
                id: String(+new Date()), 
                url, 
                lat: Number(latitude), 
                lng: Number(longitude),
                // zoom: zoom ? zoom.replace('z', '') : null
            });
            setUrl("");
        } else {
            alert("Invalid URL");
        }
    };
    return (
        <>
            <GoogleMap
                appendLink={({ link, lat, lng }: { link: string, lat: number, lng: number }) =>
                    prepend({ id: String(+new Date()), url: link, lat, lng })
                }
            />
            <div className="flex flex-row justify-between items-center w-[600px] overflow-hidden ">
                <Input
                    placeholder="https://maps.google.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-left border border-gray-200 py-2 mr-2 rounded-lg truncate w-9/12 flex h-10  rounded-md  border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          "
                />
                <Button type="button" onClick={handleAppend} className="w-3/12">
                    Paste URL
                </Button>
            </div>

            <ul className="divide-y divide-gray-200 w-full">
                {fields.map((link, index) => (
                    <li key={link.id} className="flex items-center justify-between py-3">
                        <FormField
                            control={form.control}
                            name={`mapLinks.${index}.url`}
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <span>{field.value}</span>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <button
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                            🗑️
                        </button>
                    </li>
                ))}
            </ul>
            {form.formState.errors.mapLinks && (
                <FormMessage>You must have at least one link.</FormMessage>
            )}
        </>
    );
};

const SearchFilters = () => {
    const form = useFormContext<SearchFormData>();

    return (
        <div className="space-y-4 w-full">
            <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Search Query</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Enter search query" {...field} />
                        </FormControl>
                        <FormDescription>
                            Enter your search query for places
                        </FormDescription>
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
                            <Input
                                type="number"
                                min="1"
                                placeholder="Enter radius"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                        </FormControl>
                        <FormDescription>
                            Specify the search radius in meters
                        </FormDescription>
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
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            required
                        >
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
                        <FormDescription>
                            Specify the type of place you're looking for
                        </FormDescription>
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
                            <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                        </FormControl>
                        <FormDescription>
                            Specify the amount (default is 100)
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

// Component to display statistics
const Stats = () => {
    const stats = useAtomValue(statsAtom);

    return (
        <div>
            <p>Total links: {stats.totalLinks}</p>
        </div>
    );
};

// Component to clear all links
const ClearLinks = () => {
    const [, setMapLinks] = useAtom(mapLinksAtom);

    const handleClear = () => {
        if (confirm("Are you sure you want to clear all links?")) {
            setMapLinks([]);
        }
    };

    return (
        <Button onClick={handleClear} variant="destructive" className="mx-2">
            Clear All Links
        </Button>
    );
};

const searchSchema = z.object({
    mapLinks: z
        .array(
            z.object({
                id: z.string().min(1),
                url: z.string().url(),
                lat: z.number(),
                lng: z.number(),
            })
        )
        .min(1)
        .describe("You must have at least one link"),
    query: z.string(),
    radius: z.number().min(1).max(100000),
    placeType: z.string().min(1),
    amount: z.number().min(20).max(100),
});

export type SearchFormData = z.infer<typeof searchSchema>;

const fetchPlaces = async (
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



    //   const [lat, lng] = location.split(",").map(Number);

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
            if (pagination && pagination.hasNextPage) {
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

// Main component that combines all the parts
export const MapLinksApp = () => {
    const [mapLinks] = useAtom(mapLinksAtom);
    const [places] = useAtom(placesAtom);

    const form = useForm({
        defaultValues: {
            mapLinks: [],
            query: "",
            radius: 1000,
            placeType: "",
            amount: 100,
        },
        mode: "onSubmit",
        resolver: zodResolver(searchSchema),
    });

    useEffect(() => {
        if (form.formState.isDirty && !form.formState.isValid) {
            alert("Please fill out all the fields");
        }
    }, [form.formState.isValid]);

    const [isLoading, setIsLoading] = useState(false);
    const setPlaces = useSetAtom(placesAtom);
    const [stage, setStage] = useState(0);

    const onSubmit = async (data: SearchFormData) => {
        console.log(data);

        setIsLoading(true);
        setStage(1);
        try {
            for (const location of data.mapLinks) {

                const results = await fetchPlaces(
                    data.query,
                    {
                        lat: location.lat,
                        lng: location.lng
                    },
                    data.radius,
                    data.placeType,
                    data.amount
                );
                setPlaces((prevPlaces) => [...prevPlaces, ...(results as any[])]);
            }
        } catch (error) {
            console.error("Error fetching places:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <MapLinksList />
                    <SearchFilters />

                    <Button type="submit" disabled={isLoading} id="fetchButton">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Fetching Places...
                            </>
                        ) : (
                            "Fetch Places"
                        )}
                    </Button>
                    <script
                        src={`https://maps.googleapis.com/maps/api/js?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                    ></script>
                </form>
            </Form>
            {stage === 1 && (
                <div className="w-full">
                    <PlacesList />
                    {places.length > 0 && <SendMessage />}
                </div>
            )}
        </div>
    );
};
