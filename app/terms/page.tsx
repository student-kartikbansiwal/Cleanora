import ContentPage from "@/components/layout/ContentPage";

export const metadata = { title: "Terms of Service | Cleanora" };

export default function TermsPage() {
  return (
    <ContentPage
      badge="Legal"
      title="Terms of Service"
      subtitle="Last updated: June 2026"
    >
      <div className="bg-white rounded-2xl border border-border p-8 space-y-6 text-[#64748B] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Acceptance of Terms</h2>
          <p>By accessing cleanora.in and placing orders, you agree to these Terms of Service. If you do not agree, please do not use our website.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Products & Pricing</h2>
          <p>All prices are listed in INR and include applicable taxes unless stated otherwise. We reserve the right to modify prices without prior notice. Product images are for illustration; actual packaging may vary.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Orders & Payment</h2>
          <p>Orders are confirmed upon successful payment (or placement for COD). We reserve the right to cancel orders in case of pricing errors, stock unavailability, or suspected fraud.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Limitation of Liability</h2>
          <p>Cleanora is not liable for indirect, incidental, or consequential damages arising from use of our products or website, to the maximum extent permitted by law.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Governing Law</h2>
          <p>These terms are governed by the laws of India. Disputes shall be subject to the jurisdiction of courts in Muzaffarnagar, Uttar Pradesh.</p>
        </section>
      </div>
    </ContentPage>
  );
}
