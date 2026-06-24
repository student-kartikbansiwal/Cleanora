import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboardClient from "@/components/dashboard/UserDashboardClient";

export const metadata = {
  title: "My Orders | Cleanora",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard/orders");
  }
  return <UserDashboardClient user={session.user} initialTab="orders" />;
}
