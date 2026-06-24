import { redirect } from "next/navigation";

/**
 * /admin/coupons/new — redirects to /admin/coupons?new=1
 * The coupons page reads the `new` query param and auto-opens the create form.
 */
export default function NewCouponPage() {
  redirect("/admin/coupons?new=1");
}
