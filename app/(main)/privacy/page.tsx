import ContentPage from "@/components/layout/ContentPage";

export const metadata = { title: "Privacy Policy | Cleanora" };

export default function PrivacyPage() {
  return (
    <ContentPage
      badge="Legal"
      title="Privacy Policy"
      subtitle="Last updated: June 2026"
    >
      <div className="bg-white rounded-2xl border border-border p-8 space-y-6 text-[#64748B] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Information We Collect</h2>
          <p>We collect information you provide when creating an account, placing orders, or contacting us — including name, email, phone number, shipping address, and payment details (processed securely via Razorpay).</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and deliver your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Improve our products and website experience</li>
            <li>Send promotional emails (you can unsubscribe anytime)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Data Security</h2>
          <p>We use industry-standard encryption and secure payment gateways. We do not store credit card details on our servers.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Your Rights</h2>
          <p>You may request access, correction, or deletion of your personal data by contacting privacy@cleanora.in.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Contact</h2>
          <p>For privacy-related questions, email privacy@cleanora.in or write to Cleanora, 515 Adarsh Colony, Pachenda Road, Muzaffarnagar, UP.</p>
        </section>
      </div>
    </ContentPage>
  );
}
