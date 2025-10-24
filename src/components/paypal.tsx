"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

interface PayPalCheckoutProps {
  amount: string;
  onCreateOrder: () => Promise<string>;
  onSuccess: (details: any, orderId: string) => void; // Added orderId parameter
  onError?: (error: any) => void;
  onCancel?: () => void;
  currency?: string;
  disabled?: boolean;
  funding?: "paypal" | "card" | "venmo" | "paylater";
}

export default function PayPalCheckout({
  amount,
  onCreateOrder,
  onSuccess,
  onError,
  onCancel,
  currency = "USD",
  disabled = false,
  funding,
}: PayPalCheckoutProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>(""); // Store order ID

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return <div className="text-red-600">PayPal Client ID not configured</div>;
  }

  const handleCreateOrder = async () => {
    try {
      setError("");
      setLoading(true);
      const orderId = await onCreateOrder();
      if (!orderId) {
        throw new Error("Failed to create order");
      }
      setCurrentOrderId(orderId); // Store the order ID
      return orderId;
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.message || "Failed to create order. Please try again.");
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (data: any, actions: any) => {
    try {
      setLoading(true);
      if (actions.order) {
        const details = await actions.order.capture();
        onSuccess(details, currentOrderId); // Pass both details and orderId
      }
    } catch (err: any) {
      console.error("Error approving order:", err);
      setError("Failed to complete payment. Please try again.");
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    console.error("PayPal Error:", err);
    setError("Payment failed. Please try again.");
    if (onError) {
      onError(err);
    }
  };

  const handleCancel = () => {
    console.log("Payment cancelled");
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="w-full">
      <PayPalScriptProvider
        options={{
          clientId: clientId,
          currency: currency,
          intent: "capture",
          ...(funding && { "enable-funding": funding }),
        }}
      >
        <PayPalButtons
          disabled={disabled || loading}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={handleError}
          onCancel={handleCancel}
          fundingSource={funding}
          style={{
            layout: "vertical",
            label: "pay",
          }}
        />
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        {loading && <p className="text-gray-600 mt-2 text-sm">Processing...</p>}
      </PayPalScriptProvider>
    </div>
  );
}
