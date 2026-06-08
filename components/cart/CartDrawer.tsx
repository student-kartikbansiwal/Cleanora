"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const subtotal = getTotalPrice();
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-navy-900/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[80] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-primary-600" />
                </div>
                <div>
                  <h2 className="font-bold text-navy-700">Shopping Cart</h2>
                  <p className="text-xs text-muted-foreground">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="btn-ghost p-2 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
                  <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center">
                    <Package size={40} className="text-primary-300" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-navy-700 mb-2">Your cart is empty</h3>
                    <p className="text-sm text-muted-foreground">
                      Looks like you haven&apos;t added anything yet.
                    </p>
                  </div>
                  <button onClick={closeCart} className="btn-primary">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder-product.png"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-navy-700 truncate mb-1">
                            {item.name}
                          </h4>
                          <p className="text-primary-600 font-bold text-sm">
                            {formatPrice(item.price)}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity - 1)
                                }
                                className="w-6 h-6 rounded-md bg-white border border-border flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.stock}
                                className="w-6 h-6 rounded-md bg-white border border-border flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-colors disabled:opacity-40"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer - Totals */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-gray-50/50 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-primary-600 font-medium" : "font-medium"}>
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(499 - subtotal)} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-navy-700 text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="btn-primary w-full text-center flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="btn-outline w-full text-center"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
