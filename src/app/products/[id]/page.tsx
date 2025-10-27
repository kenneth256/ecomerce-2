"use client";
import { useProductStore } from "@/store/useProductStore";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Product } from "@/store/useProductStore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/usecartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import Head from "next/head";

function ProductSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <Skeleton className="aspect-square w-full mb-4 rounded-lg" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-md" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-7 w-1/4" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
      <div className="mt-16">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-20" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const { getProductById, isLoading, products } = useProductStore();
  const { addToCart, removeFromCart, cartItems, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const fetchedProduct = await getProductById(id);

      if (!fetchedProduct) {
        router.push("/notfound");
      } else {
        setProduct(fetchedProduct);

        const recommended = products
          .filter(
            (p) =>
              p.id !== fetchedProduct.id &&
              p.category.name === fetchedProduct.category.name
          )
          .slice(0, 4);

        setRecommendedProducts(recommended);
      }
    };

    fetchProduct();
  }, [id, getProductById, router, products]);
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  useEffect(() => {
    if (product) {
      const itemsInCart = cartItems.filter(
        (item) => item.productId === product.id
      );
      const totalQuantity = itemsInCart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setQuantity(totalQuantity);
    }
  }, [product, cartItems]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (product) {
      try {
        const cartItem = {
          productID: product.id,
          quantity: 1,
          color: Array.isArray(product.color)
            ? product.color[0] || ""
            : product.color || "",
          size: Array.isArray(product.sizes)
            ? product.sizes[0] || ""
            : product.sizes || "",
        };

        await addToCart(cartItem);
        toast.success("Item added to cart");
      } catch (error) {
        console.error("Add to cart error:", error);
        toast.error("Failed to add item to cart");
      }
    }
  };

  const handleRemoveFromCart = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!product) return;

    try {
      const cartItem = cartItems.find((item) => item.productId === product.id);

      if (!cartItem) {
        toast.error("Item not in cart");
        setQuantity(0);
        return;
      }

      await removeFromCart(cartItem.id);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast.error("Failed to remove item");
    }
  };

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{product.name} | UG Mart</title>
        <meta
          name="description"
          content={
            product.description
              ? product.description.slice(0, 160)
              : "Discover this amazing product on UG Mart. Shop now for the best deals!"
          }
        />
        <meta
          name="keywords"
          content={
            product.category.name
              ? `UG Mart, buy ${product.category.name}, ${product.name}, online shopping`
              : "UG Mart, online shopping, e-commerce"
          }
        />
        <meta name="author" content="UG Mart" />
        <meta property="og:title" content={`${product.name} | UG Mart`} />
        <meta
          property="og:description"
          content={
            product.description
              ? product.description.slice(0, 160)
              : "Discover this amazing product on UG Mart. Shop now for the best deals!"
          }
        />
        <meta
          property="og:image"
          content={
            product.images && product.images.length > 0
              ? product.images[0]
              : "/default-og-image.jpg"
          }
        />
        <meta property="og:type" content="product" />
      </Head>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
              <Image
                alt={product.name}
                src={product.images[selectedImage]}
                fill
                className="object-contain hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 500px) 100vw, 50vw"
                priority
                quality={100}
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-gray-500 scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image}
                      fill
                      alt={`${product.name} - Image ${index + 1}`}
                      className="object-contain"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {product.price && (
              <p className="text-2xl font-semibold text-green-600 mb-4">
                UGX {product.price.toFixed(2)}
              </p>
            )}

            {product.rating !== undefined && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  {product.rating?.toFixed(1)} ({product.rating || 0} reviews)
                </span>
              </div>
            )}

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Card className="mb-6">
              <CardContent className="pt-6 space-y-3">
                {product.stock !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Stock:</span>
                    <span
                      className={`font-semibold ${
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock < 10
                            ? "text-orange-600"
                            : "text-green-600"
                      }`}
                    >
                      {product.stock === 0
                        ? "Out of Stock"
                        : `${product.stock} available`}
                    </span>
                  </div>
                )}

                {product.stock !== undefined &&
                  product.stock > 0 &&
                  product.stock < 20 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="font-medium">
                        Only {product.stock} left in stock!
                      </span>
                    </div>
                  )}

                {product.soldCount !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      Total Sales:
                    </span>
                    <span className="font-semibold text-blue-600">
                      {product.soldCount.toLocaleString()} sold
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {product.category.name && (
              <div className="mb-4">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                  {product.category.name}
                </span>
              </div>
            )}

            {quantity < 1 ? (
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full"
                size="lg"
              >
                Add to cart
              </Button>
            ) : (
              <div className="flex gap-3 items-center justify-center">
                <Button onClick={handleRemoveFromCart} size="sm">
                  -
                </Button>
                <span className="text-lg font-semibold">{quantity}</span>
                <Button onClick={handleAddToCart} size="sm">
                  +
                </Button>
              </div>
            )}
          </div>
        </div>

        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
              {recommendedProducts.map((recProduct) => (
                <Card
                  key={recProduct.id}
                  onClick={() => router.push(`/products/${recProduct.id}`)}
                  className="cursor-pointer hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="relative aspect-video bg-gray-100">
                    <Image
                      src={recProduct.images[0]}
                      alt={recProduct.name}
                      width={50}
                      height={50}
                      className="object-contain w-60 h-50 p-3"
                    />
                  </div>
                  <CardContent className="p-2">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {recProduct.name}
                    </h3>
                    {recProduct.rating !== undefined && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(recProduct.rating || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {recProduct.rating?.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-black/80 ">
                        UGX {recProduct.price?.toFixed(2)}
                      </span>
                      {recProduct.stock !== undefined &&
                        recProduct.stock < 10 &&
                        recProduct.stock > 0 && (
                          <span className="text-xs text-orange-600 font-medium">
                            Only {recProduct.stock} left
                          </span>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
