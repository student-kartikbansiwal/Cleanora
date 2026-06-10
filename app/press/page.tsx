import ContentPage from "@/components/layout/ContentPage";

export const metadata = { title: "Press | Cleanora" };

export default function PressPage() {
  return (
    <ContentPage
      badge="Media"
      title="Press & Media"
      subtitle="Resources for journalists and media professionals."
    >
      <div className="bg-white rounded-2xl border border-border p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[#0F172A] mb-3">About Cleanora</h2>
          <p className="text-[#64748B] leading-relaxed">
            Cleanora is a premium household cleaning brand founded in 2018, offering eco-friendly,
            effective cleaning solutions across India. With over 50,000 customers and ISO 9001:2015
            certified manufacturing, Cleanora is committed to Clean Living, Better Living.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#0F172A] mb-3">Media Contact</h2>
          <p className="text-[#64748B]">
            For press inquiries, interviews, or brand assets, contact us at{" "}
            <a href="mailto:press@cleanora.in" className="text-primary-600 hover:underline">
              press@cleanora.in
            </a>
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#0F172A] mb-3">Brand Assets</h2>
          <p className="text-[#64748B]">
            Logo files, product images, and brand guidelines are available upon request.
            Please email press@cleanora.in with your publication details.
          </p>
        </section>
      </div>
    </ContentPage>
  );
}
