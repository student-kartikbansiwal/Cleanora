import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session = null;

  try {
    session = await auth();
  } catch {
    // Auth not configured or token error — redirect to login
    redirect("/auth/login?callbackUrl=/admin");
  }

  if (!session || session.user?.role !== "admin") {
    redirect("/auth/login?callbackUrl=/admin");
  }

  // Admin uses its own full-page layout — no shared Header/Footer
  return (
    <div className="admin-root">
      {children}
    </div>
  );
}
