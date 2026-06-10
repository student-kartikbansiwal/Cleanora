"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store/wishlistStore";
import { loadWishlistFromServer, syncWishlistToServer } from "@/lib/wishlist";

export default function WishlistSync() {
  const { data: session, status } = useSession();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      syncedRef.current = false;
      return;
    }

    if (syncedRef.current) return;
    syncedRef.current = true;

    const sync = async () => {
      const localItems = useWishlistStore.getState().items;
      if (localItems.length > 0) {
        await syncWishlistToServer(localItems);
      } else {
        await loadWishlistFromServer();
      }
    };

    sync();
  }, [status, session?.user]);

  useEffect(() => {
    if (status !== "authenticated") {
      syncedRef.current = false;
    }
  }, [status]);

  return null;
}
