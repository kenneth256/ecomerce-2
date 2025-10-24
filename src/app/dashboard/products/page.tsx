"use client";
import { useProductStore } from "@/store/useProductStore";
import { PencilIcon, Trash2, Trash2Icon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { formatSizes } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProductsPage = () => {
  const { products, fetchAllProducts, error, deleteProduct, getProductById } =
    useProductStore();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
  };

  const handleDit = (id: string) => {
    console.log(`/dashboard/editProduct/${id}`);
    router.push(`/dashboard/EditProduct/${id}`);
  };

  useEffect(() => {
    fetchAllProducts();
    console.log(products);
  }, [fetchAllProducts]);

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-gray-400">No products found.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Products</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Total Sold</TableHead>
            <TableHead>Revenue@product</TableHead>
            <TableHead>Delete Product</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products
            .filter((p) => p)
            .map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images?.[0] ? (
                    <div className="relative w-12 bg-gray-100 h-12 overflow-hidden rounded">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="object-cover rounded-sm"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <p>{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      sizes: {formatSizes(product.sizes)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>UGX: {product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product?.category?.name}</TableCell>
                <TableCell>{product.soldCount}</TableCell>
                <TableCell>
                  ${Number(product.soldCount) * Number(product.price)}
                </TableCell>
                <TableCell className="flex gap-1">
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/EditProduct/${product.id}`)
                      }
                      className="hover:opacity-80 transition-opacity"
                      aria-label="Edit coupon"
                    >
                      <PencilIcon className="text-blue-700 h-6 w-6 cursor-pointer" />
                    </button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="hover:opacity-80 transition-opacity"
                          aria-label="Delete coupon"
                        >
                          <Trash2 className="text-red-600 h-6 w-6 hover:text-red-900 cursor-pointer" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the product "{product.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsPage;
