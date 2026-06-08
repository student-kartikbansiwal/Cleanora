import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import B2BSection from "@/components/home/B2BSection";
import FAQSection from "@/components/home/FAQSection";
import BestSellers from "@/components/home/BestSellers";

export const metadata: Metadata = {
  title: "Cleanora — Premium Cleaning Products | Clean Living, Better Living",
  description:
    "Shop Cleanora's premium household and commercial cleaning products. Bathroom cleaners, floor cleaners, hand wash, sanitizers, and more. Free shipping on orders above ₹499.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <BestSellers />
      <WhyChooseUs />
      <TestimonialsSection />
      <B2BSection />
      <FAQSection />
    </>
  );
}
