import type { Metadata } from "next";
import { MapLinksApp } from "./components/MapLinks";
import { GoogleMap } from "./components/Map";

export const metadata: Metadata = {
  title: "Google Maps Links | Next.js + TypeScript Example",
};

export default function IndexPage(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center">
      <GoogleMap />
      <h3 className="text-2xl font-bold py-4">Google Maps Links Manager</h3>
      <MapLinksApp />
    </div>
  );
}
