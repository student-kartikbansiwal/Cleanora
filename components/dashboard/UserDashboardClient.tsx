"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package, Heart, MapPin, Bell, User, ChevronRight,
  ShoppingBag, Clock, CheckCircle, Truck, XCircle, Plus,
  Edit2, Trash2, Loader2, Save, Star
} from "lucide-react";
import { formatPrice, getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

interface WishlistProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  stock: number;
}

interface UserProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  initialTab?: string;
}

interface Order {
  _id: string;
  orderId: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: { name: string; image: string; quantity: number; price: number }[];
  createdAt: string;
  shippingAddress: { name: string; phone: string; street: string; city: string; state: string; pincode: string };
}

interface Address {
  _id: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
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

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

const EMPTY_ADDRESS = {
  label: "Home",
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

export default function UserDashboardClient({ user, initialTab = "profile" }: UserProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user.name || "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (activeTab === "orders") {
      setLoading(true);
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => { if (data.success) setOrders(data.orders); })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "wishlist") {
      setWishlistLoading(true);
      fetch("/api/wishlist")
        .then((r) => r.json())
        .then((data) => { if (data.success) setWishlistProducts(data.products); })
        .finally(() => setWishlistLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "addresses") {
      setAddressLoading(true);
      fetch("/api/user/addresses")
        .then((r) => r.json())
        .then((data) => { if (data.success) setAddresses(data.addresses); })
        .finally(() => setAddressLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "notifications") {
      setNotifLoading(true);
      fetch("/api/user/notifications")
        .then((r) => r.json())
        .then((data) => { if (data.success) setNotifications(data.notifications); })
        .finally(() => setNotifLoading(false));
    }
  }, [activeTab]);

  const handleRemoveFromWishlist = async (productId: string) => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", productId }),
    });
    const data = await res.json();
    if (data.success) setWishlistProducts(data.products);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(addressForm.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(addressForm.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    setSavingAddress(true);
    try {
      const method = editingAddress ? "PUT" : "POST";
      const url = editingAddress ? `/api/user/addresses/${editingAddress._id}` : "/api/user/addresses";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses);
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm(EMPTY_ADDRESS);
        toast.success(editingAddress ? "Address updated!" : "Address added!");
      } else {
        toast.error(data.message || "Failed to save address");
      }
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setAddresses(data.addresses);
      toast.success("Address deleted");
    } else {
      toast.error(data.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    const addr = addresses.find(a => a._id === id);
    if (!addr) return;
    const res = await fetch(`/api/user/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addr, isDefault: true }),
    });
    const data = await res.json();
    if (data.success) setAddresses(data.addresses);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    await fetch(`/api/user/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
                    {id === "notifications" && unreadCount > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
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
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-navy-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                          className="input-field"
                          minLength={2}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-700 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email || ""}
                          disabled
                          className="input-field opacity-60 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-700 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="10-digit mobile number"
                          className="input-field"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-700 mb-1.5">
                          Account Type
                        </label>
                        <input
                          type="text"
                          value={user.role === "admin" ? "Administrator" : "Customer"}
                          disabled
                          className="input-field opacity-60 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary flex items-center gap-2"
                    >
                      {savingProfile ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Changes
                    </button>
                  </form>
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
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                                {order.paymentMethod} · {order.paymentStatus}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary-600">{formatPrice(order.totalAmount)}</p>
                              <span
                                className={`badge text-xs mt-1 inline-flex items-center gap-1 ${
                                  config?.color || "bg-gray-100 text-gray-700"
                                }`}
                              >
                                <StatusIcon size={12} />
                                {config?.label || order.orderStatus}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                            {order.items.slice(0, 3).map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 flex-shrink-0 bg-gray-50 rounded-lg px-3 py-2"
                              >
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
                                  <p className="text-xs font-medium text-navy-700 max-w-[100px] truncate">
                                    {item.name}
                                  </p>
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
                            <Link href={`/track/${order.orderId}`} className="btn-outline text-sm py-1.5 px-4">
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy-700">Your Wishlist</h2>
                    <span className="badge-primary">{wishlistProducts.length} items</span>
                  </div>

                  {wishlistLoading ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="skeleton h-32 rounded-2xl" />
                      ))}
                    </div>
                  ) : wishlistProducts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-border p-12 text-center">
                      <Heart size={48} className="text-primary-200 mx-auto mb-4" />
                      <h3 className="font-semibold text-navy-700 mb-2">Your wishlist is empty</h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        Browse products and click the heart icon to save them.
                      </p>
                      <Link href="/shop" className="btn-primary">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {wishlistProducts.map((product) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-2xl border border-border p-4 flex gap-4"
                        >
                          <Link
                            href={`/shop/${product.slug}`}
                            className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0"
                          >
                            <Image
                              src={product.images[0]?.url || "/placeholder-product.png"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/shop/${product.slug}`}>
                              <p className="font-semibold text-navy-700 text-sm truncate hover:text-primary-600">
                                {product.name}
                              </p>
                            </Link>
                            <p className="font-bold text-primary-600 mt-1">{formatPrice(product.price)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {product.stock > 0 ? "In Stock" : "Out of Stock"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromWishlist(product._id)}
                            className="text-red-400 hover:text-red-600 p-1 self-start"
                            aria-label="Remove from wishlist"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy-700">Saved Addresses</h2>
                    <button
                      onClick={() => {
                        setShowAddressForm(true);
                        setEditingAddress(null);
                        setAddressForm(EMPTY_ADDRESS);
                      }}
                      className="btn-primary text-sm py-2 flex items-center gap-2"
                    >
                      <Plus size={16} /> Add Address
                    </button>
                  </div>

                  {/* Address Form */}
                  {showAddressForm && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border-2 border-primary-200 p-6"
                    >
                      <h3 className="font-bold text-navy-700 mb-4">
                        {editingAddress ? "Edit Address" : "Add New Address"}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-navy-700 mb-1">
                            Label
                          </label>
                          <select
                            value={addressForm.label}
                            onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                            className="input-field"
                          >
                            <option>Home</option>
                            <option>Work</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-navy-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Full name"
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-navy-700 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="10-digit mobile"
                            className="input-field"
                            maxLength={10}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-navy-700 mb-1">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))}
                            placeholder="6-digit pincode"
                            className="input-field"
                            maxLength={6}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-navy-700 mb-1">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={addressForm.street}
                            onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))}
                            placeholder="House no., Street, Area"
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-navy-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                            placeholder="City"
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-navy-700 mb-1">
                            State *
                          </label>
                          <select
                            value={addressForm.state}
                            onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                            className="input-field"
                            required
                          >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) =>
                              setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))
                            }
                            className="rounded border-border"
                          />
                          <label htmlFor="isDefault" className="text-sm font-medium text-navy-700">
                            Set as default address
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          className="btn-outline flex-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAddress}
                          disabled={savingAddress}
                          className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                          {savingAddress ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          {editingAddress ? "Update" : "Save"} Address
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {addressLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                      ))}
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-border p-12 text-center">
                      <MapPin size={48} className="text-primary-200 mx-auto mb-4" />
                      <h3 className="font-semibold text-navy-700 mb-2">No saved addresses</h3>
                      <p className="text-muted-foreground text-sm">
                        Add an address for faster checkout.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`bg-white rounded-2xl border-2 p-5 ${
                            addr.isDefault ? "border-primary-400" : "border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <MapPin size={20} className="text-primary-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-navy-700">{addr.label}</span>
                                  {addr.isDefault && (
                                    <span className="badge bg-primary-100 text-primary-700 text-xs">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-navy-600 mt-1">
                                  {addr.name} · {addr.phone}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(addr._id)}
                                  className="text-xs text-primary-600 hover:underline whitespace-nowrap"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingAddress(addr);
                                  setAddressForm({
                                    label: addr.label,
                                    name: addr.name,
                                    phone: addr.phone,
                                    street: addr.street,
                                    city: addr.city,
                                    state: addr.state,
                                    pincode: addr.pincode,
                                    country: addr.country,
                                    isDefault: addr.isDefault,
                                  });
                                  setShowAddressForm(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy-700">Notifications</h2>
                    {unreadCount > 0 && (
                      <span className="badge bg-red-100 text-red-700">{unreadCount} unread</span>
                    )}
                  </div>

                  {notifLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-16 rounded-2xl" />
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-border p-12 text-center">
                      <Bell size={48} className="text-primary-200 mx-auto mb-4" />
                      <h3 className="font-semibold text-navy-700 mb-2">No notifications</h3>
                      <p className="text-muted-foreground text-sm">You&apos;re all caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => !notif.isRead && handleMarkNotifRead(notif._id)}
                          className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                            notif.isRead
                              ? "border-border opacity-70"
                              : "border-primary-200 shadow-sm"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notif.isRead ? "bg-gray-300" : "bg-primary-500"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-navy-700 text-sm">{notif.title}</p>
                              <p className="text-muted-foreground text-sm mt-0.5">{notif.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <Star size={14} className="text-primary-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
