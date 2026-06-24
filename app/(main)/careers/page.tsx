import ContentPage from "@/components/layout/ContentPage";
import Link from "next/link";

export const metadata = { title: "Careers | Cleanora" };

export default function CareersPage() {
  return (
    <ContentPage
      badge="Join Our Team"
      title="Careers at Cleanora"
      subtitle="Help us make India cleaner, one home at a time."
    >
      <div className="bg-white rounded-2xl border border-border p-8 space-y-6">
        <p className="text-[#64748B] leading-relaxed">
          At Cleanora, we&apos;re building India&apos;s most trusted cleaning products brand.
          We&apos;re always looking for passionate people who care about quality, sustainability, and customer experience.
        </p>
        <h2 className="text-xl font-bold text-[#0F172A]">Open Positions</h2>
        <div className="space-y-4">
          {[
            { title: "Sales Executive", location: "Muzaffarnagar, UP", type: "Full-time" },
            { title: "Digital Marketing Specialist", location: "Remote / Hybrid", type: "Full-time" },
            { title: "Customer Support Associate", location: "Muzaffarnagar, UP", type: "Full-time" },
            { title: "Warehouse Operations", location: "Muzaffarnagar, UP", type: "Full-time" },
          ].map((job) => (
            <div key={job.title} className="p-5 rounded-xl border border-border hover:border-primary-200 transition-colors">
              <h3 className="font-semibold text-[#0F172A]">{job.title}</h3>
              <p className="text-sm text-[#64748B] mt-1">{job.location} · {job.type}</p>
            </div>
          ))}
        </div>
        <p className="text-[#64748B]">
          Send your resume to{" "}
          <a href="mailto:careers@cleanora.in" className="text-primary-600 hover:underline">
            careers@cleanora.in
          </a>{" "}
          or reach out via our{" "}
          <Link href="/contact" className="text-primary-600 hover:underline">contact page</Link>.
        </p>
      </div>
    </ContentPage>
  );
}
