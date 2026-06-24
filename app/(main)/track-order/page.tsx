"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContentPage from "@/components/layout/ContentPage";
import { Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) {
      toast.error("Please enter your order ID");
      return;
    }
    setLoading(true);
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <ContentPage
      badge="Order Tracking"
      title="Track Your Order"
      subtitle="Enter your order ID to see real-time delivery status."
    >
      <div className="bg-white rounded-2xl border border-border p-8">
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-2">
              Order ID
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. CLN-M5K2A3B-XY7Z9"
                className="input-field pl-10"
                required
              />
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              Your order ID was sent to your email after placing the order.
            </p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Looking up order...</>
            ) : (
              <>Track Order</>
            )}
          </button>
        </form>
      </div>
    </ContentPage>
  );
}
