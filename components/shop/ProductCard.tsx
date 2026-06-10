"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { toggleWishlistOnServer } from "@/lib/wishlist";
import toast from "react-hot-toast";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  averageRating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  shortDescription?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { data: session } = useSession();
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const discount = calculateDiscount(product.comparePrice || 0, product.price);
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;

    setIsAddingToCart(true);
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || "",
      quantity: 1,
      sku: product.sku,
      stock: product.stock,
    });

    toast.success(`${product.name} added to cart!`);
    openCart();
    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (session?.user) {
      const data = await toggleWishlistOnServer(product._id);
      if (data.success) {
        toast.success(
          wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️"
        );
      } else {
        toast.error(data.message || "Failed to update wishlist");
      }
    } else {
      toggleItem(product._id);
      toast.success(
        wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️"
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="product-card"
    >
      <Link href={`/shop/${product.slug}`}>
        {/* Image Container */}
        <div className="product-card-image">
          <Image
            src={product.images[0]?.url || "/placeholder-product.png"}
            alt={product.images[0]?.alt || product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <span className="discount-badge">{discount}% OFF</span>
            )}
            {product.isBestSeller && (
              <span className="badge bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Best Seller
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors"
            >
              <Heart
                size={15}
                className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
              />
            </motion.button>
            <Link href={`/shop/${product.slug}`}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-primary-50 transition-colors"
              >
                <Eye size={15} className="text-gray-400 hover:text-primary-600" />
              </motion.div>
            </Link>
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
              <span className="badge bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-navy-700 text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors mb-1.5">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={
                      star <= Math.round(product.averageRating)
                        ? "star-filled"
                        : "star-empty"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-navy-700">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={16} />
            {isAddingToCart ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
}
