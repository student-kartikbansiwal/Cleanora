"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
  Save,
  Loader2,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
}

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface StatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}

interface Order {
  _id: string;
  orderId: string;
  user: { name: string; email: string; phone?: string };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingCharge: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "failed", "refunded"];

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-purple-100 text-purple-700",
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  placed: <Package size={14} />,
  confirmed: <CheckCircle size={14} />,
  processing: <Clock size={14} />,
  shipped: <Truck size={14} />,
  out_for_delivery: <Truck size={14} />,
  delivered: <CheckCircle size={14} />,
  cancelled: <XCircle size={14} />,
  returned: <XCircle size={14} />,
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const o: Order = data.order;
          setOrder(o);
          setOrderStatus(o.orderStatus);
          setPaymentStatus(o.paymentStatus);
          setTrackingNumber(o.trackingNumber || "");
          setEstimatedDelivery(
            o.estimatedDelivery
              ? new Date(o.estimatedDelivery).toISOString().split("T")[0]
              : ""
          );
          setNotes(o.notes || "");
        } else {
          toast.error("Order not found");
        }
      })
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = {
        orderStatus,
        paymentStatus,
      };
      if (trackingNumber) body.trackingNumber = trackingNumber;
      if (estimatedDelivery) body.estimatedDelivery = estimatedDelivery;
      if (notes) body.notes = notes;

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        toast.success("Order updated successfully");
      } else {
        toast.error("Failed to update order");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#00A86B] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Order not found</h2>
          <Link href="/admin/orders" className="btn-primary text-sm">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Slim sidebar */}
      <aside className="w-16 bg-[#0F172A] flex-shrink-0 flex flex-col items-center py-4 gap-4">
        <Link href="/admin/orders" className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <Link href="/admin/orders" className="text-[#00A86B]">
          <ShoppingBag size={20} />
        </Link>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)] sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">
              Order{" "}
              <span className="font-mono text-[#00A86B]">#{order.orderId}</span>
            </h1>
            <p className="text-xs text-[#64748B]">
              Placed {formatDate(order.createdAt)} · Last updated{" "}
              {formatDate(order.updatedAt)}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        <div className="p-6 grid lg:grid-cols-3 gap-6">
          {/* Left column — items + status history */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm"
            >
              <div className="px-5 py-4 border-b border-[var(--color-border)]">
                <h2 className="font-bold text-[#0F172A]">
                  Order Items ({order.items.length})
                </h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 p-5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder-product.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A]">{item.name}</p>
                      <p className="text-xs text-[#64748B]">
                        SKU: {item.sku} · Qty: {item.quantity}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                    <p className="font-bold text-[#0F172A] self-center">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              {/* Totals */}
              <div className="px-5 py-4 border-t border-[var(--color-border)] bg-gray-50 space-y-1.5 text-sm">
                <div className="flex justify-between text-[#64748B]">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#00A86B]">
                    <span>
                      Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                    </span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#64748B]">
                  <span>Shipping</span>
                  <span>
                    {order.shippingCharge === 0
                      ? "FREE"
                      : formatPrice(order.shippingCharge)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-[#0F172A] text-base pt-2 border-t border-[var(--color-border)]">
                  <span>Total</span>
                  <span className="text-[#00A86B]">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Status History */}
            {order.statusHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm"
              >
                <h2 className="font-bold text-[#0F172A] mb-4">
                  Status History
                </h2>
                <div className="space-y-3">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          STATUS_COLORS[h.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_ICONS[h.status] || <Clock size={14} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A] capitalize">
                          {h.status.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {formatDate(h.timestamp)}
                        </p>
                        {h.note && (
                          <p className="text-xs text-[#64748B] italic mt-0.5">
                            {h.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right column — update form + address + payment */}
          <div className="space-y-5">
            {/* Update Order */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm"
            >
              <h2 className="font-bold text-[#0F172A] mb-4">Update Order</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Order Status
                  </label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="input-field text-sm capitalize"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ").charAt(0).toUpperCase() +
                          s.replace(/_/g, " ").slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="input-field text-sm capitalize"
                  >
                    {PAYMENT_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DTWT123456789"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Estimated Delivery
                  </label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal note (not shown to customer)"
                    className="input-field text-sm resize-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </motion.div>

            {/* Customer & Payment */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-[#00A86B]" />
                <h3 className="font-bold text-[#0F172A]">Payment</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Method</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Status</span>
                  <span
                    className={`badge text-[10px] capitalize ${
                      STATUS_COLORS[order.paymentStatus] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayOrderId && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Razorpay Order</span>
                    <span className="font-mono text-xs text-[#64748B] truncate max-w-[120px]">
                      {order.razorpayOrderId}
                    </span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Payment ID</span>
                    <span className="font-mono text-xs text-[#64748B] truncate max-w-[120px]">
                      {order.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-5 mb-3">
                <MapPin size={16} className="text-[#00A86B]" />
                <h3 className="font-bold text-[#0F172A]">Shipping Address</h3>
              </div>
              <div className="text-sm space-y-0.5 text-[#64748B]">
                <p className="font-semibold text-[#0F172A]">
                  {order.shippingAddress.name}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-1 font-medium text-[#0F172A]">
                  📞 {order.shippingAddress.phone}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-5 mb-3">
                <Package size={16} className="text-[#00A86B]" />
                <h3 className="font-bold text-[#0F172A]">Customer</h3>
              </div>
              <div className="text-sm space-y-0.5">
                <p className="font-medium text-[#0F172A]">{order.user?.name}</p>
                <p className="text-[#64748B]">{order.user?.email}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
