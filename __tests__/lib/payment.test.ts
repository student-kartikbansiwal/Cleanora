import { describe, it, expect } from "vitest";
import crypto from "crypto";

// ─── Payment Signature Verification Logic ─────────────────────────────────────
// Pure function extracted from lib/razorpay.ts for testability

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

function generateTestSignature(orderId: string, paymentId: string, secret: string): string {
  const body = orderId + "|" + paymentId;
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

const TEST_SECRET = "test_secret_key_12345";

describe("Razorpay Payment Signature Verification", () => {
  it("returns true for a valid signature", () => {
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";
    const validSig = generateTestSignature(orderId, paymentId, TEST_SECRET);

    expect(verifyRazorpaySignature(orderId, paymentId, validSig, TEST_SECRET)).toBe(true);
  });

  it("returns false for a tampered orderId", () => {
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";
    const validSig = generateTestSignature(orderId, paymentId, TEST_SECRET);

    // Attacker tries to substitute a different order ID
    expect(verifyRazorpaySignature("order_attacker_999", paymentId, validSig, TEST_SECRET)).toBe(false);
  });

  it("returns false for a tampered paymentId", () => {
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";
    const validSig = generateTestSignature(orderId, paymentId, TEST_SECRET);

    expect(verifyRazorpaySignature(orderId, "pay_attacker_000", validSig, TEST_SECRET)).toBe(false);
  });

  it("returns false for a completely fabricated signature", () => {
    expect(
      verifyRazorpaySignature("order_abc", "pay_xyz", "fake_signature_here", TEST_SECRET)
    ).toBe(false);
  });

  it("returns false for an empty signature", () => {
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";
    expect(verifyRazorpaySignature(orderId, paymentId, "", TEST_SECRET)).toBe(false);
  });

  it("returns false when secret is wrong", () => {
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";
    const validSig = generateTestSignature(orderId, paymentId, TEST_SECRET);
    expect(verifyRazorpaySignature(orderId, paymentId, validSig, "wrong_secret")).toBe(false);
  });

  it("signature is deterministic for same inputs", () => {
    const sig1 = generateTestSignature("ord_1", "pay_1", TEST_SECRET);
    const sig2 = generateTestSignature("ord_1", "pay_1", TEST_SECRET);
    expect(sig1).toBe(sig2);
  });
});
