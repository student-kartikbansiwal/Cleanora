import { describe, it, expect } from "vitest";
import { generateOrderId, formatPrice, calculateDiscount, slugify } from "@/lib/utils";

describe("lib/utils", () => {
  describe("generateOrderId", () => {
    it("should generate an order ID starting with CLN-", () => {
      const id = generateOrderId();
      expect(id).toMatch(/^CLN-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it("should generate unique IDs", () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateOrderId()));
      expect(ids.size).toBe(100);
    });
  });

  describe("formatPrice", () => {
    it("should format prices in Indian Rupee format", () => {
      const result = formatPrice(1000);
      expect(result).toContain("1,000");
      expect(result).toContain("₹");
    });

    it("should handle zero", () => {
      expect(formatPrice(0)).toContain("0");
    });

    it("should format large amounts correctly", () => {
      const result = formatPrice(100000);
      expect(result).toContain("1,00,000");
    });
  });

  describe("calculateDiscount", () => {
    it("should calculate percentage discount correctly", () => {
      expect(calculateDiscount(1000, 800)).toBe(20);
    });

    it("should return 0 when sale price >= original", () => {
      expect(calculateDiscount(500, 600)).toBe(0);
    });

    it("should return 0 for zero original price", () => {
      expect(calculateDiscount(0, 100)).toBe(0);
    });

    it("should round to nearest integer", () => {
      const result = calculateDiscount(300, 200);
      expect(result).toBe(33);
    });
  });

  describe("slugify", () => {
    it("should convert text to slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should handle special characters", () => {
      expect(slugify("Cleanora's Premium Cleaner!")).toBe("cleanoras-premium-cleaner");
    });

    it("should collapse multiple hyphens", () => {
      expect(slugify("foo  bar")).toBe("foo-bar");
    });
  });
});
