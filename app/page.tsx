import type { Metadata } from "next";
import { MapLinksApp } from "../components/MapLinks";
import { env } from "../env";
import { GoogleMap } from "components/Map";

export const metadata: Metadata = {
  title: "Google Maps Links | Next.js + TypeScript Example",
};

export default function IndexPage(): JSX.Element {
  return (
    <div>
      {/* <iframe
        width="450"
        height="250"
        frameBorder="0" style={{ "border": "0" }}
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=Eiffel+Tower`}
        allowFullScreen>
      </iframe> */}
      <GoogleMap />
      <h1>Google Maps Links Manager</h1>

      <MapLinksApp />
    </div>
  );
}
