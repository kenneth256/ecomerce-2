import React from "react";
import Page from "./Home";
export const metadata = {
  title: "Products - UG Mart",
  description:
    "UG Mart offers quality electronics, fashion, home goods and more. Free delivery in Kampala. Shop trusted brands at competitive prices.",
  alternates: {
    canonical: "/products",
  },

  other: {
    "google-site-verification": "NnCHKbX_mKbC2Pt0D10rEHLCeHrfcEZcQyw9vY_VtbU",
  },
};

const page = () => {
  return (
    <>
      <Page />
    </>
  );
};

export default page;
