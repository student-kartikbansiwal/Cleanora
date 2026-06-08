"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import ProductForm, {
  type ProductPayload,
  type InitialProduct,
} from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [product, setProduct] = useState<InitialProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.product) {
          setProduct(d.product);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: ProductPayload) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message ?? "Failed to update product");
    }
    toast.success("Product updated successfully!");
    router.push("/admin/products");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-[#00A86B]" />
          <p className="text-sm text-[#64748B] font-medium">
            Loading product…
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 gap-4 p-6">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A]">Product Not Found</h2>
        <p className="text-[#64748B] text-sm text-center max-w-sm">
          The product you are trying to edit does not exist or could not be
          loaded.
        </p>
        <Link href="/admin/products" className="btn-primary text-sm py-2 px-6">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <ProductForm mode="edit" initialData={product} onSubmit={handleSubmit} />
  );
}
