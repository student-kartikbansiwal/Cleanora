"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Tag, ShoppingBag, ArrowRight, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal - discount + shipping;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const res = await fetch("/api/cart/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.success && data.discount > 0) {
        setDiscount(data.discount);
        setCouponApplied(true);
        toast.success(`Coupon applied! You saved ${formatPrice(data.discount)}`);
      } else if (data.success && data.discount === 0) {
        toast.error("Coupon minimum order amount not reached");
      } else {
        toast.error(data.message || "Invalid coupon code");
      }
    } catch {
      // Fallback to demo coupon if API fails
      if (couponCode.toUpperCase() === "CLEAN10") {
        const disc = Math.round(subtotal * 0.1);
        setDiscount(disc);
        setCouponApplied(true);
        toast.success(`Coupon applied! You saved ${formatPrice(disc)}`);
      } else {
        toast.error("Invalid coupon code");
      }
    }
    setApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-black text-navy-700 mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added any products yet.
          </p>
          <Link href="/shop" className="btn-primary inline-flex gap-2">
            <ShoppingBag size={20} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="bg-navy-700 py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <p className="text-white/60 text-sm mt-1">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-border p-5 flex gap-5"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder-product.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-navy-700 pr-4">{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">SKU: {item.sku}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-gray-50 text-navy-700 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-2 hover:bg-gray-50 text-navy-700 transition-colors disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-primary-600 text-lg">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart */}
            <button
              onClick={() => { clearCart(); toast.success("Cart cleared"); }}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              <Trash2 size={16} />
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border p-6 sticky top-24">
              <h2 className="font-bold text-navy-700 text-lg mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code (CLEAN10)"
                      className="input-field pl-9 text-sm py-2.5"
                      disabled={couponApplied}
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={couponApplied || applying}
                    className="px-4 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60"
                  >
                    {applying ? "..." : couponApplied ? "✓" : "Apply"}
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-primary-600 mt-1.5 flex items-center gap-1">
                    ✓ Coupon CLEAN10 applied — {formatPrice(discount)} off
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-5 pb-5 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.reduce((t, i) => t + i.quantity, 0)} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">Discount</span>
                    <span className="text-primary-600 font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? "text-primary-600 font-medium" : ""}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-black text-navy-700 text-xl mb-6">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </Link>

              <Link href="/shop" className="btn-ghost w-full text-center mt-3 text-sm">
                Continue Shopping
              </Link>

              {shipping > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-amber-700 text-xs font-medium">
                    🚚 Add {formatPrice(499 - subtotal)} more for FREE shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
