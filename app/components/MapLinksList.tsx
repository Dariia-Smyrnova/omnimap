"use client";
import {
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFieldArray, useFormContext } from "react-hook-form";
import { GoogleMap } from "./Map";
import { useState } from "react";
import { SearchFormData } from "./MapLinks";

export const MapLinksList = () => {
    const form = useFormContext<SearchFormData>();

    const { fields, prepend, remove } = useFieldArray({
        control: form.control,
        name: "mapLinks",
        rules: {
            minLength: 2,
        },
    });

    const [url, setUrl] = useState("");

    const handleAppend = () => {
        const regex = /(?:@|%40)?(?<latitude>[-]?\d+\.\d+),(?<longitude>[-]?\d+\.\d+)(?:,(?<zoom>\d+(?:\.\d+)?z))?/;
        const match = url.match(regex);
        if (match && match.groups) {
            const { latitude, longitude, zoom } = match.groups;
            prepend({
                id: String(+new Date()),
                url,
                lat: Number(latitude),
                lng: Number(longitude),
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

            {fields.length > 0 && <ul className="divide-y divide-gray-200 w-full pt-6">
                {fields.map((link, index) => (
                    <li key={link.id} className="flex items-center justify-between py-3 w-full max-w-3xl">
                        <FormField
                            control={form.control}
                            name={`mapLinks.${index}.url`}
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <span className="overflow truncate">{field.value}</span>
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
            </ul>}
            {fields.length === 0 && <p className="text-left text-md my-4 text-gray-500 pt-6">Add links to google maps locations to start searching.</p>}
            {form.formState.errors.mapLinks && (
                <FormMessage>You must have at least one link.</FormMessage>
            )}
        </>
    );
};
