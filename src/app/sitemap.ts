import { API_ROUTES } from "@/lib/api";
import axios from "axios";

export default async function sitemap() {
  const baseUrl =`${API_ROUTES}` // 

  // Static pages
  const staticPages = ["", "/about", "/products", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  try {
    // Fetch product list from your API
    const res = await axios.get(`${API_ROUTES.PRODUCTS}`); 
    const products = res.data;

    // Generate dynamic product pages
    const productPages = products.map((product : any) => ({
      url: `${baseUrl}/products/${product.id}`, // or product.slug if you have one
      lastModified: product.updatedAt || new Date().toISOString(),
    }));

    return [...staticPages, ...productPages];
  } catch (error) {
    console.error("Failed to generate product URLs for sitemap:", error);
    return staticPages;
  }
}
