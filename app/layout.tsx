import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cleanora — Premium Cleaning Products | Clean Living, Better Living",
    template: "%s | Cleanora",
  },
  description:
    "Shop Cleanora's premium household and commercial cleaning products. Bathroom cleaners, floor cleaners, hand wash, sanitizers, and more. Free shipping on orders above ₹499.",
  keywords: [
    "cleaning products",
    "household cleaner",
    "floor cleaner",
    "bathroom cleaner",
    "sanitizer",
    "hand wash",
    "Cleanora",
    "India cleaning products",
  ],
  authors: [{ name: "Cleanora" }],
  creator: "Cleanora",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://cleanora.in",
    title: "Cleanora — Premium Cleaning Products",
    description:
      "Professional-grade cleaning solutions for homes and businesses. Clean Living, Better Living.",
    siteName: "Cleanora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cleanora — Premium Cleaning Products",
    description: "Professional-grade cleaning solutions for homes and businesses.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#0F172A",
                color: "#fff",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 500,
              },
              success: {
                iconTheme: { primary: "#00A86B", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#fff" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
