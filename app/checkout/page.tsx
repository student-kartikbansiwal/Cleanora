"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import {
  MapPin, CreditCard, ArrowRight, Loader2, Check, Tag, X
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

type PaymentMethod = "razorpay" | "upi" | "cod";

interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface CouponData {
  code: string;
  discount: number;
  description?: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState<"address" | "payment" | "confirming">("address");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Address>({
    name: session?.user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);

  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
  const discount = appliedCoupon?.discount || 0;
  const shipping = subtotal - discount >= 499 ? 0 : 49;
  const total = subtotal - discount + shipping;

  // Update name from session once loaded
  useEffect(() => {
    if (session?.user?.name) {
      setAddress((prev) => ({ ...prev, name: prev.name || session.user.name || "" }));
    }
  }, [session?.user?.name]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.phone.match(/^[6-9]\d{9}$/)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!address.pincode.match(/^[1-9][0-9]{5}$/)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    setStep("payment");
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        toast.success(`Coupon applied! You save ${formatPrice(data.coupon.discount)}`);
      } else {
        toast.error(data.message || "Invalid coupon");
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/checkout");
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: { ...address, country: "India" },
          paymentMethod,
          couponCode: appliedCoupon?.code,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message);

      if (paymentMethod === "cod") {
        clearCart();
        setLoading(false);
        toast.success("Order placed successfully! 🎉");
        router.push(`/track/${orderData.orderId}`);
        return;
      }

      // Razorpay / UPI payment
      const paymentRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentData.success) {
        setLoading(false);
        throw new Error("Failed to create payment");
      }

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      const cancelPendingOrder = async () => {
        try {
          await fetch(`/api/orders/${orderData.orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "cancel" }),
          });
        } catch {
          // silently ignore
        }
        toast.error("Payment cancelled.");
        setLoading(false);
      };

      script.onerror = () => {
        toast.error("Failed to load payment gateway. Please try again.");
        cancelPendingOrder();
      };

      script.onload = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay({
          key: paymentData.key,
          amount: paymentData.amount,
          currency: "INR",
          name: "Cleanora",
          description: `Order #${orderData.orderId}`,
          order_id: paymentData.orderId,
          prefill: {
            name: session.user.name,
            email: session.user.email,
            contact: address.phone,
          },
          theme: { color: "#00A86B" },
          modal: {
            ondismiss: () => {
              cancelPendingOrder();
            },
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId: orderData.orderId,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                clearCart();
                toast.success("Payment successful! Order confirmed 🎉");
                router.push(`/track/${orderData.orderId}`);
              } else {
                toast.error("Payment verification failed");
                setLoading(false);
              }
            } catch {
              toast.error("Payment verification error");
              setLoading(false);
            }
          },
        });
        rzp.open();
      };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="bg-navy-700 py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
          <div className="flex items-center gap-4 mt-3">
            {["address", "payment"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s
                      ? "bg-primary-500 text-white"
                      : step === "payment" && s === "address"
                      ? "bg-green-500 text-white"
                      : "bg-white/20 text-white/50"
                  }`}
                >
                  {step === "payment" && s === "address" ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`text-sm capitalize ${
                    step === s ? "text-white font-medium" : "text-white/50"
                  }`}
                >
                  {s}
                </span>
                {i < 1 && <ArrowRight size={14} className="text-white/30" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === "address" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                      <MapPin size={20} className="text-primary-600" />
                    </div>
                    <h2 className="font-bold text-navy-700 text-xl">Delivery Address</h2>
                  </div>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={address.name}
                          onChange={(e) => setAddress({ ...address, name: e.target.value })}
                          placeholder="Your full name"
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          placeholder="10-digit mobile number"
                          className="input-field"
                          required
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="House/Flat no., Street, Area"
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          placeholder="City"
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1.5">
                          State *
                        </label>
                        <select
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="input-field"
                          required
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1.5">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={address.pincode}
                          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                          placeholder="6-digit pincode"
                          className="input-field"
                          required
                          maxLength={6}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                      Continue to Payment <ArrowRight size={18} />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-2xl border border-border p-6 mb-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                      <CreditCard size={20} className="text-primary-600" />
                    </div>
                    <h2 className="font-bold text-navy-700 text-xl">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: "razorpay" as PaymentMethod,
                        label: "Credit / Debit Card + UPI",
                        description: "Pay securely via Razorpay",
                        icon: "💳",
                      },
                      {
                        id: "upi" as PaymentMethod,
                        label: "UPI Direct",
                        description: "GPay, PhonePe, Paytm & more",
                        icon: "📱",
                      },
                      {
                        id: "cod" as PaymentMethod,
                        label: "Cash on Delivery",
                        description: "Pay when your order arrives",
                        icon: "🏠",
                      },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-border hover:border-primary-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="text-primary-500"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-navy-700">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep("address")} className="btn-outline flex-1">
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        {paymentMethod === "cod" ? "Place Order" : "Pay"} {formatPrice(total)} →
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-border p-6 sticky top-24">
              <h2 className="font-bold text-navy-700 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder-product.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-700 truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-primary-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Input */}
              <div className="py-4 border-t border-border">
                <p className="text-sm font-semibold text-navy-700 mb-2 flex items-center gap-1.5">
                  <Tag size={14} className="text-primary-500" /> Have a coupon?
                </p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-green-700">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">
                        You save {formatPrice(appliedCoupon.discount)}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1 rounded-lg hover:bg-green-100 text-green-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className="input-field flex-1 text-sm py-2"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-1"
                    >
                      {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 py-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600 font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? "text-primary-600" : ""}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between font-black text-navy-700 text-lg pt-3 border-t border-border">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>

              {shipping === 0 && subtotal > 0 && (
                <p className="text-xs text-primary-600 mt-2 text-center font-medium">
                  🎉 You qualify for FREE shipping!
                </p>
              )}
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Add {formatPrice(499 - subtotal + discount)} more for FREE shipping
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
