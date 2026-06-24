"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";

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
}

const CATEGORIES = [
  { label: "All Products", value: "" },
  { label: "Bathroom Cleaner", value: "bathroom-cleaner" },
  { label: "Toilet Cleaner", value: "toilet-cleaner" },
  { label: "Floor Cleaner", value: "floor-cleaner" },
  { label: "Phenyl", value: "phenyl" },
  { label: "Hand Wash", value: "hand-wash" },
  { label: "Dish Wash Liquid", value: "dish-wash-liquid" },
  { label: "Glass Cleaner", value: "glass-cleaner" },
  { label: "Kitchen Cleaner", value: "kitchen-cleaner" },
  { label: "Multi-Purpose Cleaner", value: "multi-purpose-cleaner" },
  { label: "Sanitizer", value: "sanitizer" },
];

const SORT_OPTIONS = [
  { label: "Latest", value: "createdAt_desc" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Rated", value: "averageRating_desc" },
  { label: "Best Selling", value: "soldCount_desc" },
];

function ShopContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [page, setPage] = useState(1);
  const [_isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sort.split("_");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sort: sortField,
        order: sortOrder,
        ...(search && { search }),
        ...(category && { category }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(minRating && { rating: minRating }),
      });

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
        setTotalProducts(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, minRating, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync filters when URL search params change (footer links, header search)
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setPage(1);
  }, [searchParams]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setSort("createdAt_desc");
    setPage(1);
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || minRating;

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navy-700 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-white mb-2">Shop All Products</h1>
          <p className="text-white/60">
            {totalProducts} products available · Professional cleaning solutions for every need
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className={`hidden lg:block w-64 flex-shrink-0`}>
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <h3 className="font-semibold text-navy-700 mb-3">Search</h3>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search products..."
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-navy-700 mb-3">Categories</h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => { setCategory(cat.value); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        category === cat.value
                          ? "bg-primary-500 text-white font-medium"
                          : "text-navy-600 hover:bg-primary-50 hover:text-primary-600"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-navy-700 mb-3">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    placeholder="Min ₹"
                    className="input-field text-sm w-1/2"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    placeholder="Max ₹"
                    className="input-field text-sm w-1/2"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-semibold text-navy-700 mb-3">Minimum Rating</h3>
                <div className="space-y-1">
                  {[4, 3, 2].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setMinRating(minRating === r.toString() ? "" : r.toString()); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                        minRating === r.toString()
                          ? "bg-amber-50 text-amber-700 font-medium"
                          : "text-navy-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{"★".repeat(r)}{"☆".repeat(5 - r)}</span>
                      <span>& above</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 transition-colors"
                >
                  <X size={16} />
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-navy-700">{products.length}</span> of{" "}
                <span className="font-semibold text-navy-700">{totalProducts}</span> products
              </p>
              <div className="flex items-center gap-3">
                {/* Mobile Filter */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden btn-ghost text-sm border border-border px-3 py-2"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="input-field text-sm py-2 pr-8 w-auto cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* View Mode */}
                <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-primary-500 text-white" : "text-muted-foreground hover:bg-gray-50"}`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-primary-500 text-white" : "text-muted-foreground hover:bg-gray-50"}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <div className="skeleton aspect-square" />
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                      <div className="skeleton h-9 w-full rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-navy-700 mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-primary-500 text-white"
                        : "border border-border hover:bg-primary-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#00A86B] border-t-transparent rounded-full" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
