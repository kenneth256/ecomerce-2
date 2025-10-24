"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function HomePageSkeleton() {
  return (
    <div className="bg-white w-full min-h-screen">
      {/* Banner Skeleton */}
      <div className="h-[400px] relative bg-gray-200">
        <Skeleton className="w-full h-full" />

        {/* Banner Content Overlay */}
        <div className="absolute inset-0 container mx-auto px-4 flex items-center">
          <div className="space-y-6 max-w-2xl">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-80" />
              <Skeleton className="h-12 w-72" />
            </div>
            <Skeleton className="h-16 w-64" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>

        {/* Banner Indicators */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex gap-2 z-20">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-2 w-8 rounded-full" />
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 md:hidden" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        </div>

        <div className="flex w-full px-4 gap-6">
          {/* Sidebar Filter Skeleton */}
          <aside className="w-[350px] sticky top-12 hidden md:block p-6 self-start">
            <div className="space-y-6">
              {/* Categories */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-16" />
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-8 w-12 rounded-md" />
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-20" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="p-3 shadow-sm">
                  {/* Product Image */}
                  <Skeleton className="w-full h-52 rounded-lg mb-2" />

                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex w-full justify-center gap-1 mt-10">
              <Skeleton className="h-10 w-10 rounded-md" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-md" />
              ))}
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
