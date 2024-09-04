import React, { useEffect, useState } from "react";
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
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils";
import { addContactToGoogle } from "../auth/google";
import { UpgradePlanDialog } from "./UpgradePlanDialog";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export const placesAtom = atom<EnrichedPlace[]>([]);
export const isPaidAtom = atom(false);
export const currentPageAtom = atom(1);
export const enrichAtom = atom(false);


export default function PlacesList() {
  const [places, setPlaces] = useAtom(placesAtom);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [googleIsLoading, setGoogleIsLoading] = useState(false);
  const [isEnriched, setIsEnriched] = useAtom(enrichAtom);
  const [isPaid, setIsPaid] = useAtom(isPaidAtom);
  const [userChecked, setUserChecked] = useState(false);
  const { isLoaded, user } = useUser();

  const placesPerPage = 10;
  const indexOfLastPlace = currentPage * placesPerPage;
  const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
  const currentPlaces = places.slice(indexOfFirstPlace, indexOfLastPlace);

  useEffect(() => {
    if (isLoaded) {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (email) {
        checkUserProfile(email);
      } else {
        setUserChecked(true);
      }
    }
  }, [isLoaded, user]);

  const checkUserProfile = async (email: string) => {
    const { data: dbuser, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    }
    if (dbuser) {
      console.log('ispaid', dbuser.payment_status === 'paid');
      setIsPaid(dbuser.payment_status === 'paid');
    }
    setUserChecked(true);
  };


  const enrichCurrentPlaces = async () => {
    if (!isPaid) {
      setShowUpgradeModal(true);
      return;
    }
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

  const testModal = () => {
    setShowUpgradeModal(true);
  }

  const handleUpgradePlan = () => {
    setShowUpgradeModal(false);
    console.log("upgrade plan");
  }

  const addCurrentPlacesToContacts = async () => {
    if (!isEnriched) {
      return;
    }
    setGoogleIsLoading(true);
    for (const place of currentPlaces) {
      try {
        await addContactToGoogle((place.name as string || place.website as string), place.international_phone_number!);
      } catch (error) {
        console.error("Error adding contact to Google Contacts:", error);
      }
    };
    setGoogleIsLoading(false);
  }
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(places.length / placesPerPage);

  if (!isLoaded || !userChecked) {
    return <div>Loading...</div>;
  }

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

          <div className="flex flex-row justify-between items-center  ">
            <Button
              onClick={enrichCurrentPlaces}
              disabled={isLoading}
              className="w-1/2 mr-1"
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

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  onClick={addCurrentPlacesToContacts}
                  className={cn(
                    "bg-indigo-500 w-1/2 ml-1",
                    (!isEnriched || googleIsLoading) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {googleIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding to Contacts...
                    </>
                  ) : (
                    "Add to Google Contacts"
                  )}
                </Button>
              </HoverCardTrigger>
              {!isEnriched && (
                <HoverCardContent>
                  <p>Add businesses to your Google Contacts to see who responded to your messages. Enrich first to get phone numbers.</p>
                </HoverCardContent>
              )}
            </HoverCard>
          </div>

          <Pagination className="mt-4">
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
      <Button onClick={testModal} variant={"destructive"}>Upgrade Plan</Button>
      <UpgradePlanDialog isOpen={showUpgradeModal} onClose={handleUpgradePlan} />

    </section>
  );
}
