import { describe, it, expect } from "vitest";

// ─── Coupon Discount Calculation Logic ──────────────────────────────────────
// These are pure functions extracted from the order creation logic.
// Testing them independently ensures the business logic is correct.

function calculateCouponDiscount(
  subtotal: number,
  coupon: {
    type: "percentage" | "flat";
    value: number;
    maxDiscountAmount?: number;
  }
): number {
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = Math.min(coupon.value, subtotal);
  }
  return Math.round(discount * 100) / 100;
}

function calculateShipping(subtotalAfterDiscount: number): number {
  return subtotalAfterDiscount >= 499 ? 0 : 49;
}

describe("Coupon Discount Calculation", () => {
  describe("percentage coupons", () => {
    it("applies percentage discount correctly", () => {
      const discount = calculateCouponDiscount(1000, { type: "percentage", value: 20 });
      expect(discount).toBe(200);
    });

    it("respects maxDiscountAmount cap", () => {
      const discount = calculateCouponDiscount(1000, {
        type: "percentage",
        value: 30,
        maxDiscountAmount: 100,
      });
      expect(discount).toBe(100); // Capped at 100
    });

    it("does not exceed maxDiscountAmount when discount is less", () => {
      const discount = calculateCouponDiscount(200, {
        type: "percentage",
        value: 10,
        maxDiscountAmount: 100,
      });
      expect(discount).toBe(20); // 10% of 200 = 20, well under cap
    });

    it("handles 100% discount correctly", () => {
      const discount = calculateCouponDiscount(500, { type: "percentage", value: 100 });
      expect(discount).toBe(500);
    });
  });

  describe("flat coupons", () => {
    it("applies flat discount correctly", () => {
      const discount = calculateCouponDiscount(1000, { type: "flat", value: 150 });
      expect(discount).toBe(150);
    });

    it("does not discount more than subtotal (flat)", () => {
      const discount = calculateCouponDiscount(100, { type: "flat", value: 200 });
      expect(discount).toBe(100); // Cannot exceed subtotal
    });

    it("handles exact match discount", () => {
      const discount = calculateCouponDiscount(500, { type: "flat", value: 500 });
      expect(discount).toBe(500);
    });
  });

  describe("rounding", () => {
    it("rounds to 2 decimal places", () => {
      const discount = calculateCouponDiscount(333, { type: "percentage", value: 10 });
      expect(discount).toBe(33.3);
    });
  });
});

describe("Shipping Calculation", () => {
  it("charges ₹49 for orders below ₹499", () => {
    expect(calculateShipping(498)).toBe(49);
  });

  it("free shipping at exactly ₹499", () => {
    expect(calculateShipping(499)).toBe(0);
  });

  it("free shipping for orders above ₹499", () => {
    expect(calculateShipping(1000)).toBe(0);
  });

  it("charges ₹49 for orders at ₹0", () => {
    expect(calculateShipping(0)).toBe(49);
  });
});

describe("Order Total Calculation", () => {
  it("calculates correct total with percentage coupon", () => {
    const subtotal = 1000;
    const discount = calculateCouponDiscount(subtotal, { type: "percentage", value: 10 });
    const shipping = calculateShipping(subtotal - discount);
    const total = subtotal - discount + shipping;
    expect(discount).toBe(100);
    expect(shipping).toBe(0); // 900 >= 499
    expect(total).toBe(900);
  });

  it("adds shipping when discount brings total below ₹499", () => {
    const subtotal = 600;
    const discount = calculateCouponDiscount(subtotal, { type: "flat", value: 200 });
    const shipping = calculateShipping(subtotal - discount);
    const total = subtotal - discount + shipping;
    expect(discount).toBe(200);
    expect(shipping).toBe(49); // 400 < 499
    expect(total).toBe(449);
  });
});
