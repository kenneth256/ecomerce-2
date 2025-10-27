"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Check } from "lucide-react";
import React, { useEffect } from "react";
import { useOrderStore } from "@/store/orderStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectItem } from "@/components/ui/select";
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const OrderHistory = () => {
  const {
    isLoading: ordersLoading,
    getOrdersAdmin,
    adminOrders,
    updateOrder,
  } = useOrderStore();
  const router = useRouter();
  useEffect(() => {
    getOrdersAdmin();
  }, []);

  type orderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-blue-100 text-blue-700 border-blue-200",
      PROCESSING: "bg-amber-100 text-amber-700 border-amber-200",
      SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
      DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };
  const filterOrdersByStatus = (status: orderStatus) => {
    return adminOrders.filter((order) => order.status === status);
  };
  const handleUpdateStatus = async (id: string, status: orderStatus) => {
    const result = await updateOrder(id, status);

    if (result) {
      toast.success("Order status updated");
    } else {
      toast.error("Failed to update order status");
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm mt-2">
      <CardContent className="">
        {ordersLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full border-b-4 border-black/70 animate-spin" />
            </div>
          </div>
        ) : adminOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No orders yet
            </h3>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Contact
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Items
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    PaymentStatus
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Address
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Order amount
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminOrders
                  .filter((order) => order.status !== "DELIVERED")
                  .map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-mono text-sm text-slate-700">
                        {order.user.name}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-sm text-slate-700">
                        {order.address.phonenumber}
                      </TableCell>
                      <TableCell
                        onClick={() =>
                          router.push(`/dashboard/orders/${order.id}`)
                        }
                        className="text-sm text-slate-600 cursor-pointer hover:underline"
                      >
                        <span className="font-medium text-slate-900">
                          {order.items.length}
                        </span>{" "}
                        {order.items.length > 1 ? "items" : "item"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {order.paymentStatus}
                      </TableCell>
                      <TableCell className="text-sm font-semibold font-sans">
                        {order.address.district}, {order.address.subcounty},{" "}
                        {order.address.village}
                      </TableCell>
                      <TableCell className="text-right text-sm font-bold text-slate-900">
                        <span className="text-sm font-normal text-slate-600">
                          UGX
                        </span>{" "}
                        {order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-sm border ${getStatusColor(order.status)}`}
                        >
                          {order.status === "DELIVERED" && (
                            <Check className="w-3 h-3" />
                          )}
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-bold text-slate-900">
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleUpdateStatus(order.id, value as orderStatus)
                          }
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-200 rounded-sm p-3">
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">
                              Processing
                            </SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
