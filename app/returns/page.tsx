import ContentPage from "@/components/layout/ContentPage";

export const metadata = { title: "Returns & Refunds | Cleanora" };

export default function ReturnsPage() {
  return (
    <ContentPage
      badge="Support"
      title="Returns & Refunds"
      subtitle="Hassle-free returns within 7 days of delivery."
    >
      <div className="bg-white rounded-2xl border border-border p-8 space-y-6 text-[#64748B]">
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Return Policy</h2>
          <p className="leading-relaxed">
            We accept returns within 7 days of delivery for unopened, unused products in original packaging.
            Opened or used cleaning products cannot be returned for hygiene reasons unless defective.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">How to Return</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Email support@cleanora.in with your order ID and reason for return</li>
            <li>Our team will provide a return authorization within 24 hours</li>
            <li>Pack the product securely and ship to the address provided</li>
            <li>Refund is processed within 5–7 business days after we receive the item</li>
          </ol>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Refund Method</h2>
          <p>Refunds are credited to the original payment method. For Cash on Delivery orders, refunds are processed via UPI or bank transfer.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Damaged or Wrong Items</h2>
          <p>If you receive a damaged or incorrect product, contact us within 48 hours with photos. We will arrange a free replacement or full refund.</p>
        </section>
      </div>
    </ContentPage>
  );
}
