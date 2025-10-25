"use client";

import { Button } from "@/components/ui/button";
import { useSettingStore } from "@/store/settingsStore";
import { Product, useProductStore } from "@/store/useProductStore";
import { Loader, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

const Page = () => {
  const {
    banners,
    featuredProducts,
    isLoading,
    fetchbanners,
    fetchFeaturedProducts,
  } = useSettingStore();
  const { products, fetchAllProducts } = useProductStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const initialized = useRef(false);

  const router = useRouter();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchbanners();
    fetchFeaturedProducts();
    fetchAllProducts();
  }, [fetchbanners, fetchFeaturedProducts, fetchAllProducts]);

  const productsByCategory = useMemo(() => {
    return products.reduce((acc: Record<string, Product[]>, product) => {
      const category = product.category?.name || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {});
  }, [products]);

  useEffect(() => {
    if (!banners.length || isPaused) return;

    const bannerInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(bannerInterval);
  }, [banners.length, isPaused]);

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  return (
    <div className="bg-white w-full min-h-screen">
      <section
        className="h-[500px] overflow-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Banner carousel"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader className="animate-spin" />
          </div>
        )}

        {!isLoading && banners.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-600">No banners available</p>
          </div>
        )}

        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute mb-4 inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-hidden={currentSlide !== index}
          >
            <div className="inset-0 absolute">
              <Image
                alt={`Banner ${index + 1}`}
                src={banner.imageUrl}
                className="w-full h-full object-cover"
                fill
                priority={index === 0}
                sizes="100vw"
                quality={85}
              />
              <div
                className="bg-black inset-0 absolute opacity-50"
                aria-hidden="true"
              />

              <div className="relative h-full mx-auto container px-4 flex items-center">
                <div className="space-y-6 text-white max-w-2xl">
                  <span className="text-sm font-bold tracking-wider uppercase">
                    Best Selling At
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                    UG&apos;S BEST <br /> ONLINE MARKET
                  </h1>
                  <p className="text-base md:text-lg">
                    Easy to use, efficient, environmentally friendly
                    <br />
                    High performance
                  </p>
                  <Button
                    className="bg-white hover:bg-gray-100 text-black transition-colors duration-300 font-semibold"
                    aria-label="Shop now"
                  >
                    SHOP NOW
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length > 1 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-6 flex space-x-2 z-20"
            role="tablist"
            aria-label="Banner slides"
          >
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`h-2 transition-all rounded-full ${
                  currentSlide === index
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75 w-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={currentSlide === index}
                role="tab"
              />
            ))}
          </div>
        )}
      </section>

      {featuredProducts && featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-slate-100">
          <div className="flex justify-between bg-black text-center p-2 mb-2">
            <h2 className="text-3xl font-bold text-white">Featured Products</h2>
            <p className="flex text-sm font-bold italic text-muted-foreground text-center h-full">
              see all
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer group-hover:scale-105 rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 p-2"
              >
                <div className=" aspect-square relative overflow-hidden mb-3">
                  {product.images?.[0] ? (
                    <div className="aspect-square relative overflow-hidden rounded-lg mb-3 bg-white">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm md:text-base truncate">
                    {product.name}
                  </p>
                  <p className="font-bold text-lg">
                    UGX {product.price.toLocaleString()}
                  </p>
                </div>
                <Button
                  className="w-full flex my-2"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  Buy now
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
      {products && products.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-slate-100">
          {Object.entries(productsByCategory).map(
            ([category, categoryProducts]) => (
              <div key={category} className="mb-12 last:mb-0">
                <div className="flex justify-between bg-black text-center p-2 mb-2 rounded-t-sm">
                  <h2 className="md:text-2xl font-bold text-white">
                    {category}
                  </h2>
                  <p className="flex text-sm font-bold italic text-muted-foreground text-center h-full">
                    see all
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group cursor-pointer rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 p-2"
                    >
                      <div className="aspect-square relative overflow-hidden rounded-lg mb-3 bg-gray-100">
                        {product.images?.[0] ? (
                          <div className="aspect-square relative overflow-hidden rounded-lg mb-3 bg-white">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-contain rounded-sm p-4 group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm md:text-base truncate">
                          {product.name}
                        </p>
                        <p className="font-bold text-lg">
                          UGX {product.price.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        className="w-full my-2"
                        onClick={() => router.push(`/products/${product.id}`)}
                      >
                        Buy now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </section>
      )}
    </div>
  );
};

export default Page;
