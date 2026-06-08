"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package, Heart, MapPin, Bell, User, ChevronRight,
  ShoppingBag, Clock, CheckCircle, Truck, XCircle
} from "lucide-react";
import { formatPrice, getInitials } from "@/lib/utils";

interface UserProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  totalAmount: number;
  orderStatus: string;
  items: { name: string; image: string; quantity: number }[];
  createdAt: string;
}

const ORDER_STATUS_CONFIG: Record<string, { color: string; icon: React.ComponentType<{ size: number; className?: string }>; label: string }> = {
  placed: { color: "text-blue-600 bg-blue-50", icon: Clock, label: "Order Placed" },
  confirmed: { color: "text-indigo-600 bg-indigo-50", icon: CheckCircle, label: "Confirmed" },
  processing: { color: "text-amber-600 bg-amber-50", icon: Package, label: "Processing" },
  shipped: { color: "text-orange-600 bg-orange-50", icon: Truck, label: "Shipped" },
  delivered: { color: "text-green-600 bg-green-50", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "text-red-600 bg-red-50", icon: XCircle, label: "Cancelled" },
};

const NAV_ITEMS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "orders", label: "My Orders", icon: ShoppingBag },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function UserDashboardClient({ user }: UserProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "orders") {
      setLoading(true);
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setOrders(data.orders);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-navy-700 py-12">
        <div className="container-custom">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <Image src={user.image} alt={user.name || "User"} width={64} height={64} className="rounded-2xl" />
              ) : (
                <span className="text-2xl font-black text-primary-400">
                  {getInitials(user.name || "U")}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <p className="text-white/50 text-sm">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Nav */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center justify-between w-full px-5 py-4 text-sm font-medium transition-colors border-b border-border last:border-0 ${
                    activeTab === id
                      ? "bg-primary-50 text-primary-600"
                      : "text-navy-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {label}
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-2xl border border-border p-8">
                  <h2 className="text-xl font-bold text-navy-700 mb-6">Account Information</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { label: "Full Name", value: user.name || "—" },
                      { label: "Email Address", value: user.email || "—" },
                      { label: "Account Type", value: user.role === "admin" ? "Administrator" : "Customer" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          {field.label}
                        </label>
                        <p className="text-navy-700 font-medium py-2.5 px-4 bg-gray-50 rounded-xl border border-border">
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      To update your profile, please contact support or use your Google account settings.
                    </p>
                    <Link href="/contact" className="btn-outline inline-flex text-sm py-2">
                      Contact Support
                    </Link>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy-700">My Orders</h2>
                    <span className="badge-primary">{orders.length} total</span>
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-28 rounded-2xl" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-border p-12 text-center">
                      <ShoppingBag size={48} className="text-primary-200 mx-auto mb-4" />
                      <h3 className="font-semibold text-navy-700 mb-2">No orders yet</h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        Looks like you haven&apos;t placed any orders yet.
                      </p>
                      <Link href="/shop" className="btn-primary">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    orders.map((order) => {
                      const config = ORDER_STATUS_CONFIG[order.orderStatus];
                      const StatusIcon = config?.icon || Clock;
                      return (
                        <div key={order._id} className="bg-white rounded-2xl border border-border p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-mono font-bold text-navy-700">#{order.orderId}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "long", year: "numeric"
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary-600">{formatPrice(order.totalAmount)}</p>
                              <span className={`badge text-xs mt-1 ${config?.color || "bg-gray-100 text-gray-700"}`}>
                                <StatusIcon size={12} className="mr-1" />
                                {config?.label || order.orderStatus}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                            {order.items.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex items-center gap-2 flex-shrink-0 bg-gray-50 rounded-lg px-3 py-2">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                                  <Image
                                    src={item.image || "/placeholder-product.png"}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-navy-700 max-w-[100px] truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                          <div className="mt-4 flex gap-3">
                            <Link
                              href={`/track/${order.orderId}`}
                              className="btn-outline text-sm py-1.5 px-4"
                            >
                              Track Order
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className="bg-white rounded-2xl border border-border p-8 text-center">
                  <Heart size={48} className="text-primary-200 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-navy-700 mb-2">Your Wishlist</h2>
                  <p className="text-muted-foreground mb-6">
                    Items you&apos;ve saved appear here. Browse products and click the heart icon to save them.
                  </p>
                  <Link href="/shop" className="btn-primary">
                    Browse Products
                  </Link>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="bg-white rounded-2xl border border-border p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-navy-700">Saved Addresses</h2>
                    <button className="btn-primary text-sm py-2">+ Add Address</button>
                  </div>
                  <div className="text-center py-8">
                    <MapPin size={40} className="text-primary-200 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No addresses saved yet.</p>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="bg-white rounded-2xl border border-border p-8">
                  <h2 className="text-xl font-bold text-navy-700 mb-6">Notifications</h2>
                  <div className="text-center py-8">
                    <Bell size={40} className="text-primary-200 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No notifications yet.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
