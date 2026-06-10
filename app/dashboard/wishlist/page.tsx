import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboardClient from "@/components/dashboard/UserDashboardClient";

export const metadata = {
  title: "My Wishlist | Cleanora",
};

export default async function WishlistPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard/wishlist");
  }
  return <UserDashboardClient user={session.user} initialTab="wishlist" />;
}
