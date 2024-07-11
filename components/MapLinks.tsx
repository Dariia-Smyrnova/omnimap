"use client";
import { atom, useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useState } from 'react';

// Define the structure for a map link
interface MapLink {
    url: string;
}

// Create an atom to store the list of map links
export const mapLinksAtom = atomWithStorage<MapLink[]>('mapLinks', []);

// Create a derived atom to calculate statistics
const statsAtom = atom((get) => {
    const links = get(mapLinksAtom);
    return {
        totalLinks: links.length,
    };
});

// Component to display the list of map links
const MapLinksList = () => {
    const mapLinks = useAtomValue(mapLinksAtom);

    return (
        <ul>
            {mapLinks.map((link, index) => (
                <li key={index}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                </li>
            ))}
        </ul>
    );
};

// Component to add new map links
const AddMapLink = () => {
    const [, setMapLinks] = useAtom(mapLinksAtom);
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            setMapLinks((links) => [...links, { url }]);
            setUrl('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Google Maps URL"
                required
            />
            <button type="submit">Add Map Link</button>
        </form>
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
        <button onClick={handleClear}>Clear All Links</button>
    );
};

// Main component that combines all the parts
export const MapLinksApp = () => {
    return (
        <>
            <MapLinksList />
            <AddMapLink />
            <Stats />
            <ClearLinks />
        </>
    );
};