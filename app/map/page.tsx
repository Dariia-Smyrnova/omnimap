import type { Metadata } from "next";
import { MapLinksApp } from "../components/MapLinks";

export const metadata: Metadata = {
  title: "Google Maps Links | Next.js + TypeScript Example",
};

export default function IndexPage(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center w-1/2 lg:w-1/3 mx-auto">
      <MapLinksApp />
    </div>
  );
}
