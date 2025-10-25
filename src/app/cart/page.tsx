"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/usecartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const CartPageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mx-auto mb-8" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 flex gap-4">
                <Skeleton className="w-24 h-24 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    cartItems,
    isLoading,
    fetchCart,
    removeFromCart,
    updateCart,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [user]);

 

  const handleQuantityChange = async (
    itemId: string,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }

    try {
      await updateCart(itemId, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    toast.promise(clearCart(), {
      loading: "Clearing cart...",
      success: "Cart cleared successfully",
      error: "Failed to clear cart",
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    router.push("/checkout");
  };

  if (isLoading && cartItems.length === 0) {
    return <CartPageSkeleton />;
  }

  const itemTotals = () => {
    try {
      const totals = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      return totals;
    } catch (error) {}
  };

  const amount = () => {
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    return totalAmount;
  };

  const totalPrice = amount();
  const totalQuantity = itemTotals();
  const shippingCost = totalPrice > 0 ? 5000 : 0;
  const grandTotal = totalPrice + shippingCost;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2 hover:bg-black hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
            Your Cart ({totalQuantity})
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <Card className="py-16 border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-full">
                <ShoppingBag className="h-24 w-24 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Your cart is empty
              </h2>
              <p className="text-gray-500">Add some products to get started!</p>
              <Button
                onClick={() => router.push("/")}
                className="mt-4 bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">
                  Cart Items
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-white hover:bg-red-600 border-red-300 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              <div className="hidden md:block">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-800 hover:to-gray-900">
                        <TableHead className="text-white font-semibold">
                          Product
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                          Price
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                          Quantity
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                          Total
                        </TableHead>
                        <TableHead className="text-right text-white font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                      {cartItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                <Image
                                  src={item.image || "/placeholder.png"}
                                  alt={item.name}
                                  fill
                                  className="object-contain"
                                  sizes="80px"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {item.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-black/75 ">
                              UGX {item.price.toLocaleString()}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 border-2 hover:bg-black hover:text-white hover:border-black transition-colors"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity,
                                    -1
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-bold text-gray-800">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 border-2 hover:bg-black hover:text-white hover:border-black transition-colors"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity,
                                    1
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-bold text-gray-950 text-lg">
                              UGX{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-600 hover:text-white hover:bg-red-600 transition-colors"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>

              <div className="md:hidden space-y-4">
                {cartItems.map((item) => (
                  <Card
                    key={item.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                          <Image
                            src={item.image || "/placeholder.png"}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {item.name}
                              </p>
                              {item.color && (
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">Color:</span>{" "}
                                  {item.color}
                                </p>
                              )}
                              {item.size && (
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">Size:</span>{" "}
                                  {item.size}
                                </p>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-600 hover:text-white h-8 w-8 transition-colors"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            UGX {item.price.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 border-2 hover:bg-black hover:text-white hover:border-black"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity,
                                    -1
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-bold text-gray-800 text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 border-2 hover:bg-black hover:text-white hover:border-black"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity,
                                    1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-bold text-green-600">
                              UGX{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6 bg-white">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Subtotal ({totalQuantity} items)
                      </span>
                      <span className="font-semibold text-gray-800">
                        UGX {totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Shipping
                      </span>
                      <span className="font-semibold text-gray-800">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `UGX ${shippingCost.toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-lg">
                          Total
                        </span>
                        <span className="font-bold text-2xl text-green-700">
                          UGX {grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>

                  <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                    <p>🔒 Secure checkout • Taxes calculated at checkout</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
