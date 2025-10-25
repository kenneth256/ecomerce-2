"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useSettingStore } from "@/store/settingsStore";
import { Product, useProductStore } from "@/store/useProductStore";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const BannerCarousel = memo(() => {
  const { banners, isLoading, error } = useSettingStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-red-500">Error loading banners: {error}</p>
      </div>
    );
  }

  return (
    <div
      className="h-[400px] overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Banner carousel"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="border-b-4 rounded-full border-black/75 animate-spin"></p>
        </div>
      )}

      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
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
          className="absolute left-1/2 -translate-x-1/2 bottom-8 flex gap-2 z-20"
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
    </div>
  );
});

BannerCarousel.displayName = "BannerCarousel";

const FilterSection = memo<{
  products: Product[];
  selectedCategories: string[];
  selectedBrands: string[];
  selectedSizes: string[];
  priceRange: number[];
  onToggleFilter: (
    filterType: "categories" | "sizes" | "brands",
    value: string
  ) => void;
  onPriceChange: (value: number[]) => void;
}>(
  ({
    products,
    selectedCategories,
    selectedBrands,
    selectedSizes,
    priceRange,
    onToggleFilter,
    onPriceChange,
  }) => {
    const sizes = ["S", "M", "L", "X", "XL", "XXX"];
    const { categories } = useProductStore();

    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category))
    );
    const uniqueBrands = Array.from(
      new Set(products.map((product) => product.brand))
    );

    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox
                  className="border-2 border-gray-400 "
                  aria-label={category.name}
                  id={category.id}
                  checked={selectedCategories.includes(category.name)}
                  onCheckedChange={() =>
                    onToggleFilter("categories", category.name)
                  }
                />
                <Label
                  htmlFor={category.name}
                  className="text-sm cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Price Range</h4>
          <Slider
            value={priceRange}
            onValueChange={onPriceChange}
            min={0}
            max={5000000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>UGX {priceRange[0].toLocaleString()}</span>
            <span>UGX {priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Sizes</h4>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={selectedSizes.includes(size) ? "default" : "outline"}
                onClick={() => onToggleFilter("sizes", size)}
                className="cursor-pointer hover:bg-gray-500 px-2 py-1 border text-sm hover:text-primary-foreground transition-colors"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Brands</h4>
          <div className="space-y-2">
            {uniqueBrands.map((brand) => (
              <div key={brand} className="flex items-center gap-2">
                <Checkbox
                  className="border-2 border-gray-400 "
                  id={brand}
                  aria-label={brand}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => onToggleFilter("brands", brand)}
                />
                <Label htmlFor={brand} className="text-sm cursor-pointer">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

FilterSection.displayName = "FilterSection";

const ProductCard = memo<{ product: Product }>(({ product }) => {
  const router = useRouter();
  const imageSrc: string = product.images?.[0] || "/placeholder.png";
  const handleAddToCart = () => {};

  return (
    <div className="w-full shadow-sm p-3 rounded-sm">
      <div className="w-full relative flex items-center justify-center rounded-md overflow-hidden group cursor-pointer">
        <Image
          alt={product.name}
          src={imageSrc}
          width={250}
          height={208}
          onClick={() => router.push(`/products/${product.id}`)}
          className="object-contain group-hover:scale-110 transition-transform duration-300 rounded-lg w-48 h-52"
        />
        <div
          onClick={() => router.push(`/products/${product.id}`)}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <p className="text-lg font-bold text-white">View more</p>
        </div>
      </div>
      <div className="w-full flex justify-between items-center mt-2">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        <p className="text-xs text-muted-foreground py-1 px-2 bg-gray-100 rounded-3xl">
          {product.brand}
        </p>
      </div>
      <p className="text-sm text-start mt-2 font-medium">
        Ugsh: {product.price}
      </p>
      <Button className="w-full mt-2">Add to cart</Button>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

const ProductsGrid = memo<{
  products: Product[];
  currentPage?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
}>(({ products, currentPage = 1, totalPages = 1, onPageChange }) => {
  return (
    <div>
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  p-2 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="flex w-full justify-center gap-1 mt-10">
        <Button
          disabled={currentPage === 1}
          variant="outline"
          size="icon"
          className="w-8"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          <ChevronLeft />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className="w-8"
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          size="icon"
          className="w-8"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
});

ProductsGrid.displayName = "ProductsGrid";

const Page = () => {
  const { fetchbanners, fetchFeaturedProducts } = useSettingStore();
  const {
    products,
    fetchAllProducts,
    fetchFilterProducts,
    currentPage,
    totalPages,
    filterProducts,
    getCurrentPage,
  } = useProductStore();

  const initialized = useRef(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortByOrder, setSortByOrder] = useState<"asc" | "desc">("asc");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);

  const handleSortBy = useCallback((value: string) => {
    const [newSortBy, newSortOrder] = value.split("_");
    setSortBy(newSortBy);
    setSortByOrder(newSortOrder as "asc" | "desc");
  }, []);

  const handleChangePage = useCallback(
    (newPage: number) => {
      getCurrentPage(newPage);
    },
    [getCurrentPage]
  );

  const toggleFilter = useCallback(
    (filterType: "categories" | "sizes" | "brands", value: string) => {
      const setMap = {
        sizes: setSelectedSizes,
        brands: setSelectedBrands,
        categories: setSelectedCategories,
      };
      setMap[filterType]((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
      );
    },
    []
  );

  const handlePriceChange = useCallback((value: number[]) => {
    setPriceRange(value);
    setIsPriceFilterActive(true);
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchbanners();
    fetchFeaturedProducts();
    fetchAllProducts();
  }, [fetchbanners, fetchFeaturedProducts, fetchAllProducts]);

  useEffect(() => {
    fetchFilterProducts({
      sizes: selectedSizes,
      brands: selectedBrands,
      category: selectedCategories,
      ...(isPriceFilterActive && {
        maxPrice: priceRange[1],
        minPrice: priceRange[0],
      }),
      page: currentPage,
      limit: 8,
      sortBy,
      sortOrder: sortByOrder,
    });
  }, [
    selectedBrands,
    sortBy,
    sortByOrder,
    selectedSizes,
    selectedCategories,
    currentPage,
    priceRange,
    isPriceFilterActive,
    fetchFilterProducts,
  ]);

  return (
    <div className="bg-white w-full min-h-screen">
      <BannerCarousel />

      <div className="py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h3 className="md:text-2xl font-semibold">All Products</h3>
          <div className="flex gap-2">
            <div className="md:hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Filter</Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] h-[500px] overflow-auto max-w-[500px]">
                  <DialogHeader className="py-3 border-b shrink-0">
                    <DialogTitle className="text-lg font-semibold">
                      Filters
                    </DialogTitle>
                  </DialogHeader>
                  <FilterSection
                    products={products}
                    selectedCategories={selectedCategories}
                    selectedBrands={selectedBrands}
                    selectedSizes={selectedSizes}
                    priceRange={priceRange}
                    onToggleFilter={toggleFilter}
                    onPriceChange={handlePriceChange}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <Select
                name="sort"
                value={`${sortBy}_${sortByOrder}`}
                onValueChange={handleSortBy}
              >
                <SelectTrigger className="w-[180px] items-center flex">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue className="flex" placeholder="sortby" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="isFeatured">Sortby: Featured</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="createdAt_desc">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex w-full px-4 text-center gap-6">
          <aside
            className="w-[350px] sticky top-12 hidden md:block p-6 self-start max-h-[calc(100vh-2rem)] overflow-y-auto"
            style={{ boxShadow: "8px 0 12px -6px rgba(0,0,0,0.15)" }}
          >
            <FilterSection
              products={products}
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
              selectedSizes={selectedSizes}
              priceRange={priceRange}
              onToggleFilter={toggleFilter}
              onPriceChange={handlePriceChange}
            />
          </aside>

          <ProductsGrid
            products={filterProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handleChangePage}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
