import ContentPage from "@/components/layout/ContentPage";

export const metadata = { title: "Cookie Policy | Cleanora" };

export default function CookiesPage() {
  return (
    <ContentPage
      badge="Legal"
      title="Cookie Policy"
      subtitle="How we use cookies on cleanora.in"
    >
      <div className="bg-white rounded-2xl border border-border p-8 space-y-6 text-[#64748B] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better shopping experience.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Cookies We Use</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Essential cookies:</strong> Required for login, cart, and checkout functionality</li>
            <li><strong>Preference cookies:</strong> Remember your wishlist and cart items</li>
            <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Managing Cookies</h2>
          <p>You can disable cookies in your browser settings, but some features like cart persistence and login may not work correctly.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">Contact</h2>
          <p>Questions about our cookie policy? Email privacy@cleanora.in.</p>
        </section>
      </div>
    </ContentPage>
  );
}
