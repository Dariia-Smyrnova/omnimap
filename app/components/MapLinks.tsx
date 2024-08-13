"use client";
import FilterContacts from './FilterContacts';
import { atom, useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input" // Assuming you have an Input component
import { Button } from "@/components/ui/button" // Assuming you have a Button component
import { useForm } from 'react-hook-form';


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
export const mapLinksAtom = atomWithStorage<MapLink[]>('mapLinks', []);

const getLocations = (mapLinks: MapLink[]) => {
    return mapLinks.map(link => {
        const match = link.url.match(/(?:[?&]q=|maps\/@)(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
            const [, latitude, longitude] = match;
            return `${latitude},${longitude}`;
        }
        return null;
    }).filter(Boolean);
};

// Create a derived atom to calculate statistics
const statsAtom = atom((get) => {
    const links = get(mapLinksAtom);
    return {
        totalLinks: links.length,
    };
});

// Component to display the list of map links
const MapLinksList = () => {
    const [mapLinks, setMapLinks] = useAtom(mapLinksAtom);

    const handleRemoveLink = (index: number) => {
        setMapLinks(prevLinks => prevLinks.filter((_, i) => i !== index));
    };
    return (
        <ul className="divide-y divide-gray-200">
            {mapLinks.map((link, index) => (
                <li key={index} className="flex items-center justify-between py-3">
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate mr-2"
                    >
                        {link.url}
                    </a>
                    <button
                        onClick={() => handleRemoveLink(index)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </li>
            ))}
        </ul>
    );
};


const AddMapLink = () => {
    const [mapLinks, setMapLinks] = useAtom(mapLinksAtom);
    const form = useForm({
        defaultValues: {
            url: '',
        },
    });

    const onSubmit = (data: { url: string }) => {
        setMapLinks((links) => [...links, { url: data.url }]);
        form.reset();
    };

    return (
        <section className="flex flex-col items-center justify-center w-full py-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Google Maps URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://maps.google.com/..." {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter a valid Google Maps URL to add to your list.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Add Map Link</Button>
                <ClearLinks />
            </form>
        </Form>
        </section>
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
        if (confirm('Are you sure you want to clear all links?')) {
            setMapLinks([]);
        }
    };

    return (
        <Button onClick={handleClear} variant="destructive" className='mx-2'>Clear All Links</Button>
    );
};



// Main component that combines all the parts
export const MapLinksApp = () => {
    const [mapLinks] = useAtom(mapLinksAtom);
    return (
        <div className="flex flex-col items-center justify-center">
            <MapLinksList />
                <AddMapLink />
               

            <FilterContacts locations={getLocations(mapLinks) as string[]} />
        </div>
    );
};