"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, ShoppingCart, Heart, Minus, Plus, Share2, Shield,
  Truck, RefreshCw, ChevronRight
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toggleWishlistOnServer } from "@/lib/wishlist";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string; isPrimary: boolean }[];
  category: { name: string; slug: string };
  sku: string;
  stock: number;
  averageRating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isFeatured: boolean;
  tags: string[];
  specifications?: { key: string; value: string }[];
  benefits?: string[];
  usageGuide?: string;
  volume?: string;
  ingredients?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProduct(data.product);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-background">
        <div className="container-custom py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="skeleton aspect-square rounded-2xl" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4 rounded-xl" />
              <div className="skeleton h-6 w-1/2 rounded-xl" />
              <div className="skeleton h-10 w-1/3 rounded-xl" />
              <div className="skeleton h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return notFound();

  const discount = calculateDiscount(product.comparePrice || 0, product.price);
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = () => {
    setAddingToCart(true);
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || "",
      quantity,
      sku: product.sku,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart!`);
    openCart();
    setTimeout(() => setAddingToCart(false), 600);
  };

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--color-border)] bg-white">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <Link href="/" className="hover:text-[#00A86B]">Home</Link>
            <ChevronRight size={14} />
            <Link href="/shop" className="hover:text-[#00A86B]">Shop</Link>
            <ChevronRight size={14} />
            <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-[#00A86B]">
              {product.category?.name}
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#0F172A] font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-[var(--color-border)]"
            >
              <Image
                src={product.images[selectedImage]?.url || "/placeholder-product.png"}
                alt={product.images[selectedImage]?.alt || product.name}
                fill
                className="object-contain p-4"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                  {discount}% OFF
                </span>
              )}
            </motion.div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-[#00A86B]" : "border-[var(--color-border)]"
                    }`}
                  >
                    <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Category & Badges */}
            <div className="flex items-center gap-2 mb-3">
              <Link href={`/shop?category=${product.category?.slug}`} className="badge-primary text-xs">
                {product.category?.name}
              </Link>
              {product.isBestSeller && (
                <span className="badge bg-amber-100 text-amber-700 text-xs">Best Seller</span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= Math.round(product.averageRating) ? "star-filled" : "star-empty"}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">{product.averageRating.toFixed(1)}</span>
                <span className="text-sm text-[var(--color-muted-foreground)]">({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl font-black text-[#0F172A]">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xl text-[var(--color-muted-foreground)] line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-1 rounded-lg">
                  Save {formatPrice(product.comparePrice! - product.price)}
                </span>
              )}
            </div>

            <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    {product.stock <= 10 ? `Only ${product.stock} left!` : "In Stock"}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity + Actions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-[var(--color-muted-foreground)]">
                  Total: <strong>{formatPrice(product.price * quantity)}</strong>
                </span>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="btn-primary flex-1 py-4 text-base"
                >
                  <ShoppingCart size={20} />
                  {addingToCart ? "Added!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </motion.button>
                <button
                  onClick={async () => {
                    if (session?.user) {
                      const data = await toggleWishlistOnServer(product._id);
                      if (data.success) {
                        toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
                      } else {
                        toast.error(data.message || "Failed to update wishlist");
                      }
                    } else {
                      toggleItem(product._id);
                      toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    wishlisted
                      ? "border-red-400 bg-red-50 text-red-500"
                      : "border-[var(--color-border)] hover:border-red-300 hover:bg-red-50 text-[var(--color-muted-foreground)]"
                  }`}
                >
                  <Heart size={20} className={wishlisted ? "fill-current" : ""} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied!");
                  }}
                  className="p-4 rounded-xl border-2 border-[var(--color-border)] hover:bg-gray-50 text-[var(--color-muted-foreground)] transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <Link href="/checkout" className="btn-outline w-full py-4 text-base text-center">
                Buy Now
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-[var(--color-border)]">
              {[
                { icon: Shield, label: "100% Genuine", sub: "Verified Products" },
                { icon: Truck, label: "Fast Delivery", sub: "2-5 Business Days" },
                { icon: RefreshCw, label: "Easy Returns", sub: "7-Day Policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon size={22} className="text-[#00A86B]" />
                  <p className="text-xs font-semibold text-[#0F172A]">{label}</p>
                  <p className="text-[10px] text-[var(--color-muted-foreground)]">{sub}</p>
                </div>
              ))}
            </div>

            {/* SKU */}
            <p className="text-xs text-[var(--color-muted-foreground)] mt-4">
              SKU: <span className="font-mono font-medium">{product.sku}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <div className="flex border-b border-[var(--color-border)]">
            {(["description", "specs", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "text-[#00A86B] border-b-2 border-[#00A86B] bg-[#E6FFF5]/50"
                    : "text-[var(--color-muted-foreground)] hover:text-[#0F172A]"
                }`}
              >
                {tab === "reviews" ? `Reviews (${product.reviewCount})` : tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="prose max-w-none text-[var(--color-muted-foreground)] leading-relaxed">
                    {product.description || product.shortDescription}
                  </div>
                  {product.tags?.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-[var(--color-muted-foreground)] text-sm rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "specs" && (
                <motion.div key="specs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {product.specifications && product.specifications.length > 0 ? (
                    <table className="w-full text-sm">
                      <tbody>
                        {product.specifications.map((spec) => (
                          <tr key={spec.key} className="border-b border-[var(--color-border)]">
                            <td className="py-3 pr-6 font-medium text-[#0F172A] w-1/3">{spec.key}</td>
                            <td className="py-3 text-[var(--color-muted-foreground)]">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-[var(--color-muted-foreground)]">No specifications available.</p>
                  )}
                  {product.volume && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm">
                      <span className="font-medium text-[#0F172A]">Volume: </span>
                      <span className="text-[var(--color-muted-foreground)]">{product.volume}</span>
                    </div>
                  )}
                  {product.ingredients && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm">
                      <span className="font-medium text-[#0F172A]">Ingredients: </span>
                      <span className="text-[var(--color-muted-foreground)]">{product.ingredients}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {product.reviewCount > 0 ? (
                    <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <p className="text-5xl font-black text-[#0F172A]">{product.averageRating.toFixed(1)}</p>
                        <div className="flex justify-center my-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={16} className={s <= Math.round(product.averageRating) ? "star-filled" : "star-empty"} />
                          ))}
                        </div>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{product.reviewCount} reviews</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star size={40} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-[var(--color-muted-foreground)]">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
