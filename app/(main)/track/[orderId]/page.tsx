"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone,
  ArrowLeft, ChevronRight
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import Image from "next/image";

const ORDER_STEPS = [
  { key: "placed", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

interface Order {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    image: string;
    sku: string;
  }[];
  subtotal: number;
  shippingCharge: number;
  discount: number;
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrder(data.order);
        else setError("Order not found");
      })
      .catch(() => setError("Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const getStatusStep = (status: string) => {
    const idx = ORDER_STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#00A86B] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Order Not Found</h1>
          <p className="text-[#64748B] mb-6">{error}</p>
          <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.orderStatus);

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="bg-[#0F172A] py-10">
        <div className="container-custom">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white mb-4 text-sm transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Track Your Order</h1>
          <div className="flex items-center gap-2 mt-2 text-white/60 text-sm">
            <span>Order #{order.orderId}</span>
            <ChevronRight size={14} />
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div className={`p-5 rounded-2xl border-2 ${
              order.orderStatus === "delivered"
                ? "bg-green-50 border-green-200"
                : order.orderStatus === "cancelled"
                ? "bg-red-50 border-red-200"
                : "bg-[#E6FFF5] border-[#00A86B]/30"
            }`}>
              <div className="flex items-center gap-3">
                {order.orderStatus === "cancelled"
                  ? <XCircle size={28} className="text-red-500" />
                  : order.orderStatus === "delivered"
                  ? <CheckCircle size={28} className="text-green-600" />
                  : <Truck size={28} className="text-[#00A86B]" />
                }
                <div>
                  <p className="font-bold text-[#0F172A] text-lg capitalize">
                    {order.orderStatus === "delivered" ? "Order Delivered! 🎉" : `Status: ${order.orderStatus.replace(/_/g, " ")}`}
                  </p>
                  {order.estimatedDelivery && order.orderStatus !== "delivered" && (
                    <p className="text-sm text-[#64748B]">
                      Expected by {formatDate(order.estimatedDelivery)}
                    </p>
                  )}
                  {order.trackingNumber && (
                    <p className="text-sm font-mono text-[#00A86B]">
                      Tracking: {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            {order.orderStatus !== "cancelled" && (
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
                <h2 className="font-bold text-[#0F172A] mb-6">Order Progress</h2>
                <div className="relative">
                  {/* Connector Line */}
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[#E2E8F0]" />
                  <div
                    className="absolute left-5 top-5 w-0.5 bg-[#00A86B] transition-all duration-1000"
                    style={{ height: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                  />

                  <div className="space-y-6">
                    {ORDER_STEPS.map((step, i) => {
                      const Icon = step.icon;
                      const isCompleted = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 relative"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                            isCompleted
                              ? "bg-[#00A86B] border-[#00A86B]"
                              : "bg-white border-[#E2E8F0]"
                          }`}>
                            <Icon size={18} className={isCompleted ? "text-white" : "text-[#94A3B8]"} />
                          </div>
                          <div>
                            <p className={`font-semibold ${isCompleted ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-[#00A86B] font-medium">Current Status</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
              <div className="p-5 border-b border-[var(--color-border)]">
                <h2 className="font-bold text-[#0F172A]">Order Items ({order.items.length})</h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 p-5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image src={item.image || "/placeholder-product.png"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A]">{item.name}</p>
                      <p className="text-xs text-[#64748B]">SKU: {item.sku} · Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#0F172A]">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-[#00A86B]" />
                <h3 className="font-bold text-[#0F172A]">Delivery Address</h3>
              </div>
              <div className="text-sm space-y-1 text-[#64748B]">
                <p className="font-semibold text-[#0F172A]">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <div className="flex items-center gap-1.5 pt-1 text-[#0F172A]">
                  <Phone size={13} />
                  <span>{order.shippingAddress.phone}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
              <h3 className="font-bold text-[#0F172A] mb-4">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#00A86B]">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Shipping</span>
                  <span className={order.shippingCharge === 0 ? "text-[#00A86B]" : ""}>
                    {order.shippingCharge === 0 ? "FREE" : formatPrice(order.shippingCharge)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-[#0F172A] pt-2 border-t border-[var(--color-border)]">
                  <span>Total Paid</span>
                  <span className="text-[#00A86B]">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="pt-2">
                  <span className={`badge text-xs ${
                    order.paymentStatus === "paid" ? "badge-success" : "badge-warning"
                  }`}>
                    {order.paymentStatus === "paid" ? "✓ Payment Received" : "⏳ Payment Pending"}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] capitalize">Via: {order.paymentMethod}</p>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-[#E6FFF5] rounded-2xl border border-[#00A86B]/20 p-5">
              <h3 className="font-semibold text-[#0F172A] mb-2">Need Help?</h3>
              <p className="text-xs text-[#64748B] mb-3">
                For any order issues, contact our support team
              </p>
              <a
                href="https://wa.me/7500545500"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-sm py-2.5 text-center"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
