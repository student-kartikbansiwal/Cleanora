import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDashboardClient from "@/components/dashboard/UserDashboardClient";

export const metadata = {
  title: "My Dashboard | Cleanora",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }
  return <UserDashboardClient user={session.user} />;
}
