"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Package,
  Settings,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  {
    href: "/categories",
    label: "Categories",
    dropdown: [
      { href: "/shop?category=bathroom-cleaner", label: "Bathroom Cleaner" },
      { href: "/shop?category=toilet-cleaner", label: "Toilet Cleaner" },
      { href: "/shop?category=floor-cleaner", label: "Floor Cleaner" },
      { href: "/shop?category=phenyl", label: "Phenyl" },
      { href: "/shop?category=hand-wash", label: "Hand Wash" },
      { href: "/shop?category=dish-wash-liquid", label: "Dish Wash Liquid" },
      { href: "/shop?category=glass-cleaner", label: "Glass Cleaner" },
      { href: "/shop?category=kitchen-cleaner", label: "Kitchen Cleaner" },
      { href: "/shop?category=multi-purpose-cleaner", label: "Multi-Purpose Cleaner" },
      { href: "/shop?category=sanitizer", label: "Sanitizer" },
    ],
  },
  { href: "/bulk-order", label: "B2B / Bulk" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { data: session } = useSession();
  const { getTotalItems, toggleCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/logo.svg"
                alt="Cleanora"
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <div key={link.href} className="relative">
                  {link.dropdown ? (
                    <button
                      className="btn-ghost flex items-center gap-1"
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`}
                      />
                    </button>
                  ) : (
                    <Link href={link.href} className="btn-ghost">
                      {link.label}
                    </Link>
                  )}

                  {/* Dropdown */}
                  {link.dropdown && (
                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-card-hover border border-border overflow-hidden"
                          onMouseEnter={() => setOpenDropdown(link.label)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center px-4 py-2.5 text-sm text-navy-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="btn-ghost p-2 rounded-lg"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link href="/dashboard/wishlist" className="btn-ghost p-2 rounded-lg relative">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="btn-ghost p-2 rounded-lg relative"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </button>

              {/* User */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 btn-ghost px-3 py-2 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-primary-600 font-bold text-sm">
                          {session.user?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-navy-700 max-w-[100px] truncate">
                      {session.user?.name}
                    </span>
                    <ChevronDown size={14} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-card-hover border border-border overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-semibold text-navy-700 truncate">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <LayoutDashboard size={16} />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/orders"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package size={16} />
                            My Orders
                          </Link>
                          {session.user?.role === "admin" && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Settings size={16} />
                              Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              signOut({ callbackUrl: "/" });
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth/login" className="btn-primary py-2 px-4 text-sm">
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden btn-ghost p-2 rounded-lg"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-border overflow-hidden"
            >
              <div className="container-custom py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center px-4 py-3 text-navy-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {link.dropdown && (
                      <div className="ml-4 border-l-2 border-primary-100 pl-4 space-y-0.5 mt-1">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-3 py-2 text-sm text-navy-500 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-navy-900/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsSearchOpen(false);
            }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center p-4 gap-4">
                <Search size={22} className="text-primary-500 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for cleaning products..."
                  className="flex-1 text-lg text-navy-700 placeholder:text-muted-foreground outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-muted-foreground hover:text-navy-700 transition-colors"
                >
                  <X size={22} />
                </button>
              </form>
              <div className="px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {["Bathroom Cleaner", "Floor Cleaner", "Hand Wash", "Sanitizer", "Dish Wash"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          setTimeout(() =>
                            window.location.assign(
                              `/shop?search=${encodeURIComponent(term)}`
                            ),
                            100
                          );
                          setIsSearchOpen(false);
                        }}
                        className="badge-primary py-1 px-3 text-sm cursor-pointer hover:bg-primary-100 transition-colors"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
