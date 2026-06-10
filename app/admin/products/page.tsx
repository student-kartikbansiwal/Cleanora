"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight,
  Package, Loader2, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  images: { url: string; alt?: string }[];
  category: { name: string } | null;
  soldCount: number;
  averageRating: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const LIMIT = 15;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isActive: !current } : p))
        );
        toast.success(`Product ${!current ? "activated" : "deactivated"}`);
      }
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setTotal((t) => t - 1);
        toast.success("Product deleted");
      }
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white h-16 flex items-center px-6 border-b border-[var(--color-border)] sticky top-0 z-10">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#0F172A]">Products</h1>
            <p className="text-xs text-[#64748B]">{total} total products</p>
          </div>
          <Link href="/admin/products/new" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
            <Plus size={16} />
            Add Product
          </Link>
        </div>

        <div className="p-6">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 mb-5 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products by name, SKU..."
                className="input-field pl-9 text-sm"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-[#00A86B]" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Package size={48} className="mx-auto text-[#94A3B8] mb-4" />
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No Products Found</h3>
                <p className="text-[#64748B] mb-5">Start by adding your first product</p>
                <Link href="/admin/products/new" className="btn-primary text-sm">
                  <Plus size={16} /> Add Product
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Product</th>
                      <th className="px-5 py-3 text-left">SKU</th>
                      <th className="px-5 py-3 text-left">Category</th>
                      <th className="px-5 py-3 text-right">Price</th>
                      <th className="px-5 py-3 text-right">Stock</th>
                      <th className="px-5 py-3 text-right">Sold</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {products.map((product, i) => (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {product.images?.[0]?.url ? (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Package size={20} className="absolute inset-0 m-auto text-gray-400" />
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/admin/products/${product._id}/edit`}
                                className="text-sm font-semibold text-[#0F172A] hover:text-[#00A86B] transition-colors line-clamp-1 max-w-[200px]"
                              >
                                {product.name}
                              </Link>
                              <div className="flex gap-1 mt-0.5">
                                {product.isFeatured && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs font-mono text-[#64748B]">{product.sku}</td>
                        <td className="px-5 py-3 text-sm text-[#64748B]">
                          {product.category?.name || "—"}
                        </td>
                        <td className="px-5 py-3 text-right text-sm font-bold text-[#0F172A]">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-sm font-semibold ${
                            product.stock === 0
                              ? "text-red-500"
                              : product.stock < 10
                              ? "text-amber-500"
                              : "text-[#0F172A]"
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-sm text-[#64748B]">{product.soldCount || 0}</td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => handleToggleActive(product._id, product.isActive)}
                            className="transition-colors"
                            title={product.isActive ? "Deactivate" : "Activate"}
                          >
                            {product.isActive ? (
                              <ToggleRight size={28} className="text-[#00A86B]" />
                            ) : (
                              <ToggleLeft size={28} className="text-[#94A3B8]" />
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="p-1.5 rounded-lg text-[#64748B] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </Link>
                            <button
                              onClick={() => setDeleteId(product._id)}
                              className="p-1.5 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[#64748B]">
                      Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-gray-50 disabled:opacity-40"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-medium text-[#0F172A]">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-gray-50 disabled:opacity-40"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] text-center mb-2">Delete Product?</h3>
            <p className="text-sm text-[#64748B] text-center mb-6">
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 btn-outline py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
