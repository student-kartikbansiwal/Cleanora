"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  const labelClass = open ? "hidden md:block" : "hidden";

  const handleSignOut = () => {
    // Clear client-persisted stores so the next user starts clean
    useWishlistStore.getState().clearWishlist();
    useCartStore.getState().clearCart();
    signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      className={`bg-navy-700 flex flex-col flex-shrink-0 transition-all duration-300 ${
        open ? "w-64" : "w-[72px]"
      } max-md:w-16`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-white/10">
        {open && (
          <Image
            src="/logo-white.svg"
            alt="Cleanora"
            width={130}
            height={36}
            className="hidden md:block"
            priority
          />
        )}
        <span
          className={`${
            open ? "md:hidden" : ""
          } w-8 h-8 rounded-lg bg-primary-500 text-white font-black flex items-center justify-center flex-shrink-0`}
        >
          C
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto text-white/40 hover:text-white transition-colors hidden md:block"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all max-md:justify-center ${
              isActive(href)
                ? "bg-primary-500 text-white"
                : "text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={20} className="flex-shrink-0" />
            <span className={`text-sm font-medium truncate ${labelClass}`}>
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="px-2 pb-4 border-t border-white/10 pt-4 space-y-1">
        <Link
          href="/"
          title="View Store"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors max-md:justify-center"
        >
          <Store size={20} className="flex-shrink-0" />
          <span className={`text-sm ${labelClass}`}>View Store</span>
        </Link>
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors max-md:justify-center"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`text-sm ${labelClass}`}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
