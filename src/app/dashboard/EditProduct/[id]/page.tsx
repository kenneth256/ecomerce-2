"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Upload, X, Loader2 } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";

interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const EditProductPage = () => {
  const { updateProduct, fetchCategories, getProductById, categories } =
    useProductStore();

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    brand: "",
    color: "",
    sizes: [] as string[],
    gender: "",
    rating: "",
    isFeatured: false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        toast.error("Product ID is missing");
        router.push("/dashboard/products");
        return;
      }

      setFetchingProduct(true);
      try {
        const product = await getProductById(id);
        console.log("Product fetched:", product);

        if (product) {
          console.log(
            "Product color:",
            product.color,
            "Type:",
            typeof product.color
          );
          let colorValue = "";

          if (product.color) {
            if (Array.isArray(product.color)) {
              colorValue = product.color.join(", ");
            } else if (typeof product.color === "string") {
              colorValue = product.color;
            } else {
              console.warn("Unexpected color type:", product.color);
              colorValue = String(product.color);
            }
          }

          setFormData({
            name: product.name || "",
            price: product.price?.toString() || "",
            category: product?.category?.name || "",
            description: product.description || "",
            stock: product.stock?.toString() || "",
            brand: product.brand || "",
            color: colorValue,
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            gender: product.gender || "",
            rating: product.rating?.toString() || "",
            isFeatured: !!product.isFeatured,
          });
          setExistingImages(
            Array.isArray(product.images) ? product.images : []
          );
        } else {
          console.log("Product is null or undefined");
          toast.error("Product not found");
          router.push("/dashboard/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error(
          `Failed to load product: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        router.push("/dashboard/products");
      } finally {
        setFetchingProduct(false);
      }
    };

    fetchProduct();
  }, [id, getProductById, router]);

  const handleEventChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (
        !formData.name ||
        !formData.price ||
        !formData.category ||
        !formData.stock
      ) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (parseFloat(formData.price) <= 0) {
        toast.error("Price must be greater than 0");
        setLoading(false);
        return;
      }

      if (parseInt(formData.stock) < 0) {
        toast.error("Stock cannot be negative");
        setLoading(false);
        return;
      }

      console.log("Submitting with ID:", id);
      console.log("Form data:", formData);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("price", formData.price);
      submitData.append("category", formData.category);
      submitData.append("description", formData.description);
      submitData.append("stock", formData.stock);
      submitData.append("brand", formData.brand);

      const colorArray = formData.color
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c);
      submitData.append("color", JSON.stringify(colorArray));

      submitData.append("sizes", JSON.stringify(formData.sizes));
      submitData.append("gender", formData.gender);
      submitData.append("rating", formData.rating);
      submitData.append("isFeatured", String(formData.isFeatured));
      submitData.append("existingImages", JSON.stringify(existingImages));

      images.forEach((image) => {
        submitData.append("images", image);
      });

      console.log("Calling updateProduct...");
      const result = await updateProduct(id, submitData);
      console.log("Update result:", result);

      toast.success("Product updated successfully!");
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update product: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  if (fetchingProduct) {
    return (
      <div className="min-h-screen bg-[#fffefe] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffefe] w-full">
      <div className="w-full flex flex-col p-8 lg:p-16 justify-center overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="font-bold text-2xl text-center mb-2">Edit Product</h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Update the product details below
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="name"
                  className="text-gray-700 font-medium text-sm"
                >
                  Product Name *
                </Label>
                <Input
                  name="name"
                  id="name"
                  placeholder="Enter product name"
                  className="bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full"
                  required
                  onChange={handleEventChange}
                  value={formData.name}
                />
              </div>

              <div>
                <Label
                  htmlFor="price"
                  className="text-gray-700 font-medium text-sm"
                >
                  Price *
                </Label>
                <Input
                  name="price"
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter price"
                  className="bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full"
                  required
                  onChange={handleEventChange}
                  value={formData.price}
                />
              </div>

              <div>
                <Label
                  htmlFor="category"
                  className="text-gray-700 font-medium text-sm"
                >
                  Category *
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                  value={formData.category}
                  required
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(categories)
                      .filter((category): category is Category =>
                        Boolean(category)
                      )
                      .map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="stock"
                  className="text-gray-700 font-medium text-sm"
                >
                  Stock Quantity *
                </Label>
                <Input
                  name="stock"
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="Enter stock quantity"
                  className="bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full"
                  required
                  onChange={handleEventChange}
                  value={formData.stock}
                />
              </div>

              <div>
                <Label
                  htmlFor="brand"
                  className="text-gray-700 font-medium text-sm"
                >
                  Brand
                </Label>
                <Input
                  name="brand"
                  id="brand"
                  placeholder="Enter brand name"
                  className="bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full"
                  onChange={handleEventChange}
                  value={formData.brand}
                />
              </div>

              <div>
                <Label
                  htmlFor="color"
                  className="text-gray-700 font-medium text-sm"
                >
                  Color (comma-separated)
                </Label>
                <Input
                  name="color"
                  id="color"
                  placeholder="e.g. red, blue, green"
                  className="bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full"
                  onChange={handleEventChange}
                  value={formData.color}
                />
              </div>

              <div>
                <Label
                  htmlFor="gender"
                  className="text-gray-700 font-medium text-sm"
                >
                  Gender
                </Label>
                <Select
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  value={formData.gender}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="rating"
                  className="text-gray-700 font-medium text-sm"
                >
                  Rating (0-5)
                </Label>
                <Input
                  name="rating"
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="Enter rating"
                  className="bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors w-full"
                  onChange={handleEventChange}
                  value={formData.rating}
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-gray-700 font-medium text-sm"
              >
                Description *
              </Label>
              <Textarea
                name="description"
                id="description"
                placeholder="Enter product description"
                className="bg-gray-50 border-gray-200 focus:border-gray-400 transition-colors min-h-[100px] w-full"
                required
                onChange={handleEventChange}
                value={formData.description}
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium text-sm mb-2 block">
                Available Sizes
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 rounded-md border transition-colors ${
                      formData.sizes.includes(size)
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {existingImages.length > 0 && (
              <div>
                <Label className="text-gray-700 font-medium text-sm mb-2 block">
                  Current Images
                </Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-fit object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label
                htmlFor="images"
                className="text-gray-700 font-medium text-sm mb-2 block"
              >
                Add Images
              </Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload new images
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isFeatured: checked as boolean,
                  }))
                }
              />
              <Label
                htmlFor="isFeatured"
                className="text-gray-700 font-medium text-sm cursor-pointer"
              >
                Mark as Featured Product
              </Label>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                type="submit"
                className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-2.5 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    UPDATE PRODUCT <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;
