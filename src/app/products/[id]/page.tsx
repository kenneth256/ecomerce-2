import { Metadata } from "next";
import ProductDetails from "./ProductDetails";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Product ${id} | UG Mart`,
    description: "Shop this amazing product at UG Mart",
    alternates: {
      canonical: `/products/${id}`,
    },
    openGraph: {
      title: `Product ${id} | UG Mart`,
      description: "Shop this amazing product at UG Mart",
      type: "website",
    },
  };
}

export default async function Page() {
  return <ProductDetails />;
}
