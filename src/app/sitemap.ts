import { API_ROUTES } from "@/lib/api";
import axios from "axios";

export const runtime = "edge"; // optional, faster at edge

export default async function sitemap() {
  const baseUrl = "https://ecomerce-2-p66h.vercel.app"; // your frontend domain

  
  const staticPages = ["/", "/about", "/products", "/auth"];

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add static pages
  staticPages.forEach((route) => {
    sitemapXml += `  <url>\n`;
    sitemapXml += `    <loc>${baseUrl}${route}</loc>\n`;
    sitemapXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    sitemapXml += `  </url>\n`;
  });

  try {
    // Fetch products from API
    const res = await axios.get(`${API_ROUTES.PRODUCTS}/products`);
    const products = res.data;

    // Add dynamic product pages
    products.forEach((product: any) => {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/products/${product.slug || product.id}</loc>\n`;
      sitemapXml += `    <lastmod>${product.updatedAt || new Date().toISOString()}</lastmod>\n`;
      sitemapXml += `  </url>\n`;
    });
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  sitemapXml += `</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
