"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProductForm, { type ProductPayload } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: ProductPayload) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message ?? "Failed to create product");
    }
    toast.success("Product created successfully!");
    router.push("/admin/products");
  };

  return <ProductForm mode="create" onSubmit={handleSubmit} />;
}
