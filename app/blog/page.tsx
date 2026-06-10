import ContentPage from "@/components/layout/ContentPage";
import Link from "next/link";

export const metadata = { title: "Blog | Cleanora" };

const POSTS = [
  {
    title: "5 Tips for a Sparkling Clean Bathroom",
    date: "May 15, 2026",
    excerpt: "Simple daily habits and the right products can keep your bathroom fresh and hygienic.",
  },
  {
    title: "Eco-Friendly Cleaning: What You Need to Know",
    date: "April 28, 2026",
    excerpt: "Learn how biodegradable ingredients make a difference for your home and the planet.",
  },
  {
    title: "Choosing the Right Floor Cleaner for Your Home",
    date: "April 10, 2026",
    excerpt: "Marble, tile, or wood — find the perfect Cleanora product for every surface.",
  },
];

export default function BlogPage() {
  return (
    <ContentPage
      badge="Cleanora Blog"
      title="Cleaning Tips & Insights"
      subtitle="Expert advice for a cleaner, healthier home."
    >
      <div className="space-y-6">
        {POSTS.map((post) => (
          <article key={post.title} className="bg-white rounded-2xl border border-border p-6 hover:shadow-card transition-shadow">
            <p className="text-xs text-primary-600 font-semibold mb-2">{post.date}</p>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">{post.title}</h2>
            <p className="text-[#64748B] text-sm leading-relaxed">{post.excerpt}</p>
          </article>
        ))}
        <p className="text-center text-sm text-[#64748B]">
          More articles coming soon.{" "}
          <Link href="/contact" className="text-primary-600 hover:underline">Subscribe to our newsletter</Link> for updates.
        </p>
      </div>
    </ContentPage>
  );
}
