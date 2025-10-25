"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addressStore, Address } from "@/store/addressStore";
import {
  Trash2,
  AlertCircle,
  Edit,
  Package,
  MapPin,
  Plus,
  X,
  Check,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useOrderStore } from "@/store/orderStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Page = () => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phonenumber: "",
    district: "",
    subcounty: "",
    village: "",
    isDefault: false,
  });

  const {
    addresses = [],
    isLoading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  } = addressStore();

  const {
    isLoading: ordersLoading,
    getOrdersByUser,
    userOrder = [],
  } = useOrderStore();

  useEffect(() => {
    fetchAddresses();
    getOrdersByUser();
  }, [fetchAddresses, getOrdersByUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        const result = await updateAddress(editingId, formData);
        if (result) {
          resetForm();
        }
      } else {
        const result = await createAddress(formData);
        if (result) {
          resetForm();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      address: "",
      phonenumber: "",
      district: "",
      subcounty: "",
      village: "",
      isDefault: false,
    });
    setShowAddressForm(false);
    setEditingId(null);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      email: address.email,
      address: address.address,
      phonenumber: address.phonenumber,
      district: address.district,
      subcounty: address.subcounty,
      village: address.village,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowAddressForm(true);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const success = await deleteAddress(id);
      if (success) {
        await fetchAddresses();
      }
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            My Account
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your orders and delivery addresses
          </p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 p-1 bg-slate-100 rounded-lg h-auto">
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Package className="w-4 h-4" />
              <span className="font-medium">Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Addresses</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Order History
                    </h2>
                    <p className="text-sm text-slate-600">
                      Track and manage your orders
                    </p>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                      <div className="border-t-2 border-black/75 rounded-full h-12 w-12"></div>
                    </div>
                  </div>
                ) : userOrder.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-slate-600 max-w-sm mx-auto">
                      Start shopping to see your orders here! Your purchase
                      history will appear once you place your first order.
                    </p>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">
                            Order ID
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            Items
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            Date
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            Status
                          </TableHead>
                          <TableHead className="text-right font-semibold text-slate-700">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userOrder.map((order) => (
                          <TableRow
                            key={order.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <TableCell className="font-mono text-sm text-slate-700">
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              <span className="font-medium text-slate-900">
                                {order.items.length}
                              </span>{" "}
                              {order.items.length > 1 ? "items" : "item"}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}
                              >
                                {order.status === "DELIVERED" && (
                                  <Check className="w-3 h-3" />
                                )}
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-bold text-slate-900">
                              <span className="text-sm font-normal text-slate-600">
                                UGX
                              </span>{" "}
                              {order.totalAmount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="mt-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        Delivery Addresses
                      </h2>
                      <p className="text-sm text-slate-600">
                        Manage your saved addresses
                      </p>
                    </div>
                  </div>
                  {!showAddressForm && addresses.length > 0 && (
                    <Button
                      onClick={() => setShowAddressForm(true)}
                      disabled={isLoading || isSubmitting}
                      className="hover:bg-black/75 text-white shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Address
                    </Button>
                  )}
                </div>

                {error && !isLoading && (
                  <div
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                    role="alert"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {showAddressForm && (
                  <div className="mb-6 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {editingId ? "Edit Address" : "Add New Address"}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEdit}
                        className="hover:bg-slate-200"
                        aria-label="Close form"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-slate-700 font-medium"
                          >
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            required
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-slate-700 font-medium"
                          >
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            required
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="phonenumber"
                            className="text-slate-700 font-medium"
                          >
                            Phone Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phonenumber"
                            name="phonenumber"
                            value={formData.phonenumber}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            required
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="+256 700 000000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="district"
                            className="text-slate-700 font-medium"
                          >
                            District <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            required
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Kampala"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="subcounty"
                            className="text-slate-700 font-medium"
                          >
                            Sub-county <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="subcounty"
                            name="subcounty"
                            value={formData.subcounty}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            required
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Makindye"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="village"
                            className="text-slate-700 font-medium"
                          >
                            Village <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="village"
                            name="village"
                            value={formData.village}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            required
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Kabalagala"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label
                            htmlFor="address"
                            className="text-slate-700 font-medium"
                          >
                            Street Address{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            required
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Plot 123, Ggaba Road"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-slate-200">
                            <Checkbox
                              id="isDefault"
                              checked={formData.isDefault}
                              onCheckedChange={(checked) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  isDefault: checked === true,
                                }));
                              }}
                              disabled={isSubmitting}
                            />
                            <Label
                              htmlFor="isDefault"
                              className="text-sm font-medium text-slate-700 cursor-pointer"
                            >
                              Set as default delivery address
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                          className="flex-1 border-slate-300 hover:bg-slate-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                          {isSubmitting
                            ? editingId
                              ? "Updating..."
                              : "Saving..."
                            : editingId
                              ? "Update Address"
                              : "Save Address"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {isLoading && !showAddressForm && (
                  <div className="flex justify-center items-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin"></div>
                      <p className="text-sm text-slate-600 font-medium">
                        Loading addresses...
                      </p>
                    </div>
                  </div>
                )}

                {!isLoading &&
                  !error &&
                  addresses.length === 0 &&
                  !showAddressForm && (
                    <div className="text-center py-16">
                      <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <MapPin className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        No saved addresses
                      </h3>
                      <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                        Add your first delivery address to make checkout faster
                        and easier
                      </p>
                      <Button
                        onClick={() => setShowAddressForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Address
                      </Button>
                    </div>
                  )}

                {!isLoading && addresses.length > 0 && !showAddressForm && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <Card
                        key={address.id}
                        className="border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                      >
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 text-lg">
                                {address.name}
                              </h3>
                              {address.isDefault && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                                  <Check className="w-3 h-3" />
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="font-medium text-slate-700">
                                Email:
                              </span>
                              {address.email}
                            </p>
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="font-medium text-slate-700">
                                Phone:
                              </span>
                              {address.phonenumber}
                            </p>
                            <div className="pt-2 border-t border-slate-200">
                              <p className="text-sm text-slate-900 font-medium mb-1">
                                {address.address}
                              </p>
                              <p className="text-sm text-slate-600">
                                {address.village}, {address.subcounty}
                              </p>
                              <p className="text-sm text-slate-600">
                                {address.district}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(address)}
                              className="flex-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(address.id)}
                              className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
