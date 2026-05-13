import { describe, expect, it } from "vitest";
import { appointmentCreateSchema, paymentOrderSchema } from "@/lib/validators";

describe("validators", () => {
  it("validates appointment payload", () => {
    const result = appointmentCreateSchema.safeParse({
      patientId: "pat-001",
      dentistId: "den-001",
      date: "2026-05-10",
      time: "10:00",
      branch: "Central",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid payment amount", () => {
    const result = paymentOrderSchema.safeParse({ amount: -1, purpose: "membership", userId: "usr-001" });
    expect(result.success).toBe(false);
  });
});
