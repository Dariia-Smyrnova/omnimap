import type { Metadata } from "next";

import CheckoutForm from "@/app/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Donate with hosted Checkout | Next.js + TypeScript Example",
};

export default function DonatePage(): JSX.Element {
  return (
    <div className="page-container">
      <CheckoutForm uiMode="hosted" />
    </div>
  );
}
