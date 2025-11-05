"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { addressStore } from "@/store/addressStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { Phone, MapPin, Mail, ShieldCheck, Tag } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/usecartStore";
import Image from "next/image";
import { useCouponStore } from "@/store/couponStore";
import { toast } from "sonner";
import PayPalCheckout from "@/components/paypal";
import { paymentProtected } from "@/actions/payment";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/useAuthStore";

const Checkout = () => {
  const { fetchAddresses, addresses } = addressStore();
  const [showPaymentCard, setShowPaymentCard] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [payPal, setPayPal] = useState(false);
  const router = useRouter();
  const [applyCoupon, setApplyCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<
    (typeof coupons)[0] | null
  >(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const { cartItems, clearCart } = useCartStore();
  const { fetchCoupons, coupons } = useCouponStore();
  const { isLoading, createPaypalOrder, createOrder, order } = useOrderStore();
  const { user } = useAuthStore();

  const sumtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const findDiscount = (couponCode: string) => {
    const foundCoupon = coupons.find((c) => c.code === couponCode);

    if (!foundCoupon) {
      setCouponError("Invalid discount coupon");
      setDiscount(0);
      setAppliedCoupon(null);
      return;
    }

    if (
      foundCoupon.usageLimit &&
      (foundCoupon.usageCount ?? 0) >= foundCoupon.usageLimit
    ) {
      setCouponError("Coupon usage limit reached!");
      setAppliedCoupon(null);
      setDiscount(0);
      return;
    }

    if (foundCoupon.endDate && new Date(foundCoupon.endDate) < new Date()) {
      setCouponError("Discount coupon has expired!");
      setAppliedCoupon(null);
      setDiscount(0);
      return;
    }
    setAppliedCoupon(foundCoupon);
    setCouponError("");
    setDiscount(foundCoupon.percentage ?? 0);
    toast.success(
      `Coupon ${foundCoupon.code} applied! ${foundCoupon.percentage}% off`
    );
  };

  useEffect(() => {
    console.log("🎟️ Coupon state changed:", appliedCoupon);
  }, [appliedCoupon]);
  const handleCreateOrder = async (details: any) => {
    console.log("🎟️ Applied Coupon State:", appliedCoupon);
    console.log("🆔 Coupon ID:", appliedCoupon?.id);
    console.log("💰 Total Amount:", total);
    console.log("📍 Selected Address ID:", selectedAddressId);
    try {
      const orderData = {
        addressId: selectedAddressId,
        couponId: appliedCoupon?.id,
        items: cartItems.map((item) => ({
          id: item.productId,
          name: item.name,
          image: item.image || "",
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          category: item.category || "",
          price: item.price,
          size: item.size || null,
          color: item.color || null,
        })),
        transactionId: details.id,
        paymentMethod: "PAYPAL" as const,
        totalAmount: total,
      };
      console.log("📦 Creating order with data:", orderData);
      console.log(
        "Product IDs:",
        orderData.items.map((i) => i.productId)
      );

      const FinalcreateOrder = await createOrder(orderData);
      if (!FinalcreateOrder) {
        toast.error("Error creating final order contact admin!");
        return null;
      }
      toast.success("Order completed successFully!");
      await clearCart();
      router.push("/");
    } catch (error) {}
  };

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    const defaultAddress = addresses.find((address) => address.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses]);

  const total = useMemo(() => {
    if (discount > 0) {
      return sumtotal - (sumtotal * discount) / 100;
    }
    return sumtotal;
  }, [sumtotal, discount]);
  const usdAmount = useMemo(() => {
    return parseFloat((total / 3600).toFixed(2));
  }, [total]);

  // Then you pass it to PayPal

  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      setCouponError("Please enter a coupon code");
      setDiscount(0);
      return;
    }
    findDiscount(coupon.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setCoupon("");
    setDiscount(0);
    setCouponError("");
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const handleProceedToPayment = async (email: string) => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsValidating(true);
    const result = await paymentProtected(email);
    setIsValidating(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setIsValidating(false);
    toast.success("Email validated");
    setCheckoutEmail(email);
    setShowPaymentCard(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-xl">Delivery Address</h2>
                </div>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 mb-4">No addresses found</p>
                    <Button onClick={() => router.push("/account")}>
                      Add Your First Address
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedAddressId === address.id
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                          }`}
                          onClick={() => setSelectedAddressId(address.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedAddressId === address.id}
                              onCheckedChange={(checked) =>
                                setSelectedAddressId(checked ? address.id : "")
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <p className="font-semibold text-base">
                                {address.name}
                              </p>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p className="flex items-start gap-1">
                                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span>
                                    {address.district}, {address.subcounty},{" "}
                                    {address.village}
                                  </span>
                                </p>
                                <p className="flex items-center gap-1">
                                  <Phone className="w-4 h-4 flex-shrink-0" />
                                  <span>{address.phonenumber}</span>
                                </p>
                                <p className="flex items-center gap-1">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {address.email}
                                  </span>
                                </p>
                              </div>
                              {address.isDefault && (
                                <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => router.push("/account")}
                      variant="outline"
                      className="w-full"
                    >
                      + Add New Address
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <h2 className="font-bold text-xl">Payment Details</h2>
                    <p className="text-sm text-muted-foreground">
                      All transactions are secure and encrypted
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!showPaymentCard ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={checkoutEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setCheckoutEmail(e.target.value);
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Order confirmation will be sent to this email
                      </p>
                    </div>

                    <Button
                      onClick={() => handleProceedToPayment(checkoutEmail)}
                      className="w-full"
                      size="lg"
                      disabled={
                        !selectedAddressId || !checkoutEmail || isValidating
                      }
                    >
                      {isValidating ? (
                        <div className="w-6 border-b-2 animate-spin border-white h-6 rounded-full"></div>
                      ) : (
                        "Proceed to Payment"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        ✓ Email confirmed: <strong>{checkoutEmail}</strong>
                      </p>
                    </div>

                    {!payPal ? (
                      <div className="space-y-3">
                        <h3 className="font-semibold">Select Payment Method</h3>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <span className="ml-2">Mobile Money</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setPayPal(!payPal)}
                          >
                            <span className="ml-2">Credit/Debit Card</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <span className="ml-2">Cash on Delivery</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          variant="ghost"
                          onClick={() => setPayPal(false)}
                          className="mb-2"
                        >
                          ← Back to payment methods
                        </Button>
                        <div className="container relative z-0">
                          <PayPalCheckout
                            amount={`${usdAmount}`}
                            funding="card"
                            onCreateOrder={async () => {
                              try {
                                const orderId = await createPaypalOrder(
                                  cartItems,
                                  usdAmount
                                );
                                console.log("✅ Order created:", orderId);
                                return orderId;
                              } catch (error) {
                                toast.error("❌ Order creation failed:");
                                throw error;
                              }
                            }}
                            onSuccess={async (details, orderId) => {
                              try {
                                console.log("Payment captured by PayPal!");
                                console.log("Details:", details);
                                console.log("Order ID:", orderId);

                                await handleCreateOrder(details);
                              } catch (error) {
                                toast.error(
                                  "❌ Error processing successful payment:"
                                );
                                toast.error(
                                  "Payment successful but order creation failed. Please contact support."
                                );
                              }
                            }}
                            onError={(err) => {
                              console.error("PayPal error:", err);
                              toast.error("Payment failed. Please try again.");
                            }}
                            onCancel={() => {
                              console.log("User cancelled payment");
                              toast.info("Payment cancelled");
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <h3 className="font-bold text-xl">Order Summary</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <Image
                          alt={item.name}
                          width={64}
                          height={64}
                          src={item.image}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold">
                          UGX {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>UGX {sumtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>
                        -UGX {((sumtotal * discount) / 100).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>UGX 0</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <div className="text-right">
                    <div className="text-blue-600">
                      UGX {sumtotal.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground font-normal">
                      ≈ ${usdAmount} USD
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Coupon Section */}
                {!applyCoupon ? (
                  <Button
                    onClick={() => setApplyCoupon(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Have a discount code?
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {discount > 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-sm font-semibold text-green-800">
                                {coupon.toUpperCase()}
                              </p>
                              <p className="text-xs text-green-600">
                                {discount}% discount applied
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveCoupon}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <Input
                            onChange={(e) =>
                              setCoupon(e.target.value.toUpperCase())
                            }
                            placeholder="Enter coupon code"
                            value={coupon}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleApplyCoupon()
                            }
                            className="uppercase"
                          />
                          <Button onClick={handleApplyCoupon} size="default">
                            Apply
                          </Button>
                        </div>
                        {couponError && (
                          <p className="text-red-600 text-sm font-medium">
                            ✗ {couponError}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                <Separator />

                {/* Security Badge */}
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <p className="text-xs text-muted-foreground">
                    Secure checkout powered by SSL encryption
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
