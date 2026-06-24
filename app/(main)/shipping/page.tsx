import ContentPage from "@/components/layout/ContentPage";

export const metadata = { title: "Shipping Policy | Cleanora" };

export default function ShippingPage() {
  return (
    <ContentPage
      badge="Support"
      title="Shipping Policy"
      subtitle="Everything you need to know about delivery."
    >
      <div className="bg-white rounded-2xl border border-border p-8 prose prose-sm max-w-none text-[#64748B] space-y-6">
        <section>
          <h2 className="text-lg font-bold text-[#0F172A]">Free Shipping</h2>
          <p>Orders above ₹499 qualify for free standard shipping across India. Orders below ₹499 incur a flat shipping charge of ₹49.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A]">Delivery Timeline</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Metro cities: 2–4 business days</li>
            <li>Tier 2/3 cities: 4–7 business days</li>
            <li>Remote areas: 7–10 business days</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A]">Order Tracking</h2>
          <p>Once your order is shipped, you will receive a tracking link via email and SMS. You can also track your order on our Track Order page using your order ID.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A]">Shipping Partners</h2>
          <p>We partner with leading logistics providers including Delhivery, BlueDart, and India Post to ensure safe and timely delivery.</p>
        </section>
      </div>
    </ContentPage>
  );
}
