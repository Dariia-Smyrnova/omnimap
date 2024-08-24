// Function to call the Google Places API

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { atom, useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { EnrichedPlace, enrichPlace } from "./Enrichment";

export const placesAtom = atom<EnrichedPlace[]>([]);
export const currentPageAtom = atom(1);
export const enrichAtom = atom(false);

export default function PlacesList() {
  const [places, setPlaces] = useAtom(placesAtom);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnriched, setIsEnriched] = useAtom(enrichAtom);
  const placesPerPage = 10;
  const indexOfLastPlace = currentPage * placesPerPage;
  const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
  const currentPlaces = places.slice(indexOfFirstPlace, indexOfLastPlace);

  const enrichCurrentPlaces = async () => {
    setIsLoading(true);
    try {
      const enrichedPlaces = await Promise.all(
        places.map((place) => enrichPlace(place))
      );
      setPlaces(enrichedPlaces);
      setIsEnriched(true)
    } catch (error) {
      console.error("Error enriching places:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(places.length / placesPerPage);

  return (
    <section className="flex flex-col items-center justify-center w-full py-8">
      {places.length > 0 && (
        <div className="flex flex-col items-left justify-left w-full py-8">
          <h3 className="text-2xl font-bold mb-4">Places</h3>
          <ul className="divide-y divide-gray-200">
            {currentPlaces
              .map((place, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <span className="font-bold">{place.name}</span>
                    {place.formatted_phone_number && (
                      <span className="ml-2">
                        {place.formatted_phone_number}
                      </span>
                    )}
                    {place.website && (
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-500"
                      >
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
            className="my-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enriching Results...
              </>
            ) : (
              "Enrich Results"
            )}
          </Button>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
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
                <PaginationNext onClick={() => paginate(currentPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
}
