import { useWishlistStore } from "@/store/wishlistStore";

export async function syncWishlistToServer(productIds: string[]) {
  const res = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sync", productIds }),
  });
  const data = await res.json();
  if (data.success) {
    useWishlistStore.setState({
      items: data.productIds,
      count: data.productIds.length,
    });
  }
  return data;
}

export async function toggleWishlistOnServer(productId: string) {
  const res = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "toggle", productId }),
  });
  const data = await res.json();
  if (data.success) {
    useWishlistStore.setState({
      items: data.productIds,
      count: data.productIds.length,
    });
  }
  return data;
}

export async function removeFromWishlistOnServer(productId: string) {
  const res = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "remove", productId }),
  });
  const data = await res.json();
  if (data.success) {
    useWishlistStore.setState({
      items: data.productIds,
      count: data.productIds.length,
    });
  }
  return data;
}

export async function loadWishlistFromServer() {
  const res = await fetch("/api/wishlist");
  const data = await res.json();
  if (data.success) {
    useWishlistStore.setState({
      items: data.productIds,
      count: data.productIds.length,
    });
  }
  return data;
}
