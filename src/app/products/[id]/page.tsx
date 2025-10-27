import { Metadata } from "next";
import ProductDetails from "./ProductDetails";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Product ${params.id} | UG Mart`,
    description: "Shop this amazing product at UG Mart",
    alternates: {
      canonical: `/products/${params.id}`,
    },
    openGraph: {
      title: `Product ${params.id} | UG Mart`,
      description: "Shop this amazing product at UG Mart",
      type: "website",
    },
  };
}

export default function Page() {
  return <ProductDetails />;
}
