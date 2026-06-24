"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useWishlistStore } from "@/store/wishlistStore";

/**
 * WishlistSync — syncs the local Zustand wishlist with the server DB.
 * - On login: if local items exist, syncs them up to the server;
 *   otherwise loads the server wishlist into the local store.
 * - On logout: resets the sync flag so next login re-syncs.
 * - Skipped entirely on /admin routes (admins don't need wishlist sync).
 */
export default function WishlistSync() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const syncedRef = useRef(false);
  const userId = session?.user?.id;

  // Skip wishlist sync on admin pages entirely
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;
    if (status !== "authenticated" || !userId) {
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return;
    syncedRef.current = true;

    const sync = async () => {
      try {
        const localItems = useWishlistStore.getState().items;

        if (localItems.length > 0) {
          // Push local items up to the server
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "sync", productIds: localItems }),
          });
          const data = await res.json();
          if (data.success && data.productIds) {
            // Update local store with the server-validated IDs
            const store = useWishlistStore.getState();
            store.clearWishlist();
            data.productIds.forEach((id: string) => store.addItem(id));
          }
        } else {
          // Load the server wishlist into local store
          const res = await fetch("/api/wishlist");
          const data = await res.json();
          if (data.success && data.productIds) {
            const store = useWishlistStore.getState();
            store.clearWishlist();
            data.productIds.forEach((id: string) => store.addItem(id));
          }
        }
      } catch (err) {
        // Wishlist sync is non-critical — don't crash the app
        console.warn("[WishlistSync] Sync failed:", err);
      }
    };

    sync();
  }, [status, userId, isAdminRoute]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      syncedRef.current = false;
    }
  }, [status]);

  return null;
}
