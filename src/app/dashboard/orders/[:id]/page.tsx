"use client";
import { useOrderStore } from "@/store/orderStore";
import { useParams, usePathname } from "next/navigation";
import React, { useEffect } from "react";

const OrderDetailsPage = () => {
  const params = useParams();

  const id: string = params.id as string;

  const { order, isLoading, error, getOrdersByUser } = useOrderStore();

  useEffect(() => {
    getOrdersByUser();
  }, [id]);

  console.log("Order from store:", order);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!id || id === "orders")
    return <p className="p-6 text-red-500">No order ID in URL</p>;

  if (!order) return <p className="p-6">No order found</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      <p>
        <strong>Order ID:</strong> {order.id}
      </p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      <p>
        <strong>Total:</strong> UGX{" "}
        {Number(order.totalAmount || 0).toLocaleString()}
      </p>

      <h3 className="text-xl font-semibold mt-4 mb-2">Items:</h3>
      {order.items?.length > 0 ? (
        <ul>
          {order.items.map((item) => (
            <li key={item.id} className="mb-2">
              {item.name} - Qty: {item.quantity} - UGX{" "}
              {Number(item.price || 0).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No items</p>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm">Raw Data</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs">
          {JSON.stringify(order, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default OrderDetailsPage;
