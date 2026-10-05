import { describe, expect, it } from "vitest";
import { evaluateAccessControl } from "@/lib/access/evaluateAccessControl";

const baseProfile = {
  trial: null as string | null,
  company_id: "co-1",
  created_at: "2026-01-01T00:00:00.000Z",
  status: null as string | null,
  plano_ativo: null as string | null,
};

describe("evaluateAccessControl", () => {
  it("denies when profile is missing", () => {
    const result = evaluateAccessControl(null, false);
    expect(result.authorized).toBe(false);
    expect(result.authorizationReason).toBeNull();
  });

  it("authorizes active trial within 7 days", () => {
    const created = new Date("2026-07-20T12:00:00.000Z");
    const now = created.getTime() + 2 * 24 * 60 * 60 * 1000;
    const result = evaluateAccessControl(
      { ...baseProfile, trial: "ativo", created_at: created.toISOString() },
      false,
      now,
    );
    expect(result.isTrial).toBe(true);
    expect(result.authorized).toBe(true);
    expect(result.authorizationReason).toBeNull();
  });

  it("expires trial after 7 days", () => {
    const created = new Date("2026-07-01T12:00:00.000Z");
    const now = created.getTime() + 8 * 24 * 60 * 60 * 1000;
    const result = evaluateAccessControl(
      { ...baseProfile, trial: "ativo", created_at: created.toISOString() },
      false,
      now,
    );
    expect(result.isTrial).toBe(false);
    expect(result.authorized).toBe(false);
    expect(result.authorizationReason).toBe("trial_expired");
  });

  it("authorizes paid plan even without company.ativo", () => {
    const result = evaluateAccessControl(
      { ...baseProfile, status: "ativo", plano_ativo: "gestao-pro" },
      false,
    );
    expect(result.authorized).toBe(true);
  });

  it("authorizes when company is ativo", () => {
    const result = evaluateAccessControl(baseProfile, true);
    expect(result.authorized).toBe(true);
    expect(result.companyStatus).toBe(true);
  });

  it("returns onboarding_incomplete without company_id", () => {
    const result = evaluateAccessControl(
      { ...baseProfile, company_id: null },
      false,
    );
    expect(result.authorized).toBe(false);
    expect(result.authorizationReason).toBe("onboarding_incomplete");
  });

  it("returns payment_pending when plan chosen but status not ativo", () => {
    const result = evaluateAccessControl(
      { ...baseProfile, plano_ativo: "gestao-basico", status: "pendente" },
      false,
    );
    expect(result.authorized).toBe(false);
    expect(result.authorizationReason).toBe("payment_pending");
  });
});
