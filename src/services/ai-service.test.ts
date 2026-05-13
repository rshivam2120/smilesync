import { describe, expect, it } from "vitest";
import { buildSmileAnalysis, respondToSymptom } from "@/services/ai-service";

describe("ai service", () => {
  it("returns deterministic smile score shape", () => {
    const result = buildSmileAnalysis(25, "alignment");
    expect(result.alignment).toBeGreaterThan(0);
    expect(result.recommendations.length).toBe(3);
  });

  it("responds to symptom keywords", () => {
    expect(respondToSymptom("I have pain in tooth")).toContain("pain");
  });
});
