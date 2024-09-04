"use client";
import PlacesList, { placesAtom } from "./PlacesList";
import { useAtom, useSetAtom } from "jotai";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, useFormContext } from "react-hook-form";
import SendMessage from "./SendMessage";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { MapLinksList } from "./MapLinksList";
import { fetchPlaces } from "@/lib/utils";

export type SearchFormData = z.infer<typeof searchSchema>;

interface MapLink {
    url: string;
}

export const mapLinksAtom = atomWithStorage<MapLink[]>("mapLinks", []);


const SearchFilters = () => {
    const form = useFormContext<SearchFormData>();

    return (
        <div className="space-y-4 w-full mt-12 text-2xl">
            <h3 className="text-2xl font-bold mb-4">Search Options</h3>
            <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Query</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Eg: Restaurant in Texas" {...field} />
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
    amount: z.number().min(20).max(1000),
});


export const MapLinksApp = () => {
    const [places] = useAtom(placesAtom);

    const form = useForm({
        defaultValues: {
            mapLinks: [],
            query: "",
            radius: 1000,
            placeType: "",
            amount: 20,
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
                    <SignedOut>
                        <SignInButton>
                            <Button type="button" className="my-6">Sign in to start</Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Button type="submit" disabled={isLoading} id="fetchButton" className="my-6">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Fetching Places...
                                </>
                            ) : (
                                "Fetch Places"
                            )}
                        </Button>
                    </SignedIn>
                    <script
                        src={`https://maps.googleapis.com/maps/api/js?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                    ></script>
                </form>
            </Form>
            {(
                <div className="w-full">
                    <PlacesList />
                    {places.length > 0 && <SendMessage />}
                </div>
            )}
        </div>
    );
};
