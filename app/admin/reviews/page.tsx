"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Check, X, Trash2, Star } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";

interface Review {
  _id: string;
  rating: number;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { name: string; email: string };
  product: { name: string; slug: string; images: { url: string }[] };
}

const STATUS_TABS = ["all", "pending", "approved", "rejected"] as const;
type StatusTab = typeof STATUS_TABS[number];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusTab>("pending");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [statusFilter, page]);

  const handleModerate = async (id: string, status: "approved" | "rejected") => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Review ${status}`);
      fetchReviews();
    } else {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Review deleted");
      fetchReviews();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Customer Reviews</h1>
          <p className="text-sm text-muted-foreground">{total} reviews</p>
        </div>
        <Link href="/admin" className="btn-outline text-sm py-2">← Dashboard</Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatusFilter(tab); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              statusFilter === tab ? "bg-white text-navy-700 shadow-sm" : "text-muted-foreground hover:text-navy-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <MessageSquare size={48} className="text-primary-200 mx-auto mb-4" />
          <p className="text-muted-foreground">No {statusFilter !== "all" ? statusFilter : ""} reviews</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={review.product?.images?.[0]?.url || "/placeholder-product.png"}
                    alt={review.product?.name || "Product"}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/shop/${review.product?.slug}`}
                        className="text-sm font-semibold text-navy-700 hover:text-primary-600"
                        target="_blank"
                      >
                        {review.product?.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        {review.isVerifiedPurchase && (
                          <span className="badge bg-green-100 text-green-700 text-xs">Verified Purchase</span>
                        )}
                        <span className={`badge text-xs ${
                          review.status === "approved" ? "bg-green-100 text-green-700" :
                          review.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {review.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="font-medium text-navy-700">{review.user?.name}</p>
                      <p>{review.user?.email}</p>
                      <p>{new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-navy-700 text-sm mt-2">{review.title}</p>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-3">{review.body}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                {review.status !== "approved" && (
                  <button
                    onClick={() => handleModerate(review._id, "approved")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button
                    onClick={() => handleModerate(review._id, "rejected")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <X size={14} /> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 text-sm font-medium hover:bg-gray-100 transition-colors ml-auto"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn-outline text-sm py-1.5 px-4 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={reviews.length < 20}
          className="btn-outline text-sm py-1.5 px-4 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
