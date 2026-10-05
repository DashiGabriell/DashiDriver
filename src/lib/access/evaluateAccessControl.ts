/**
 * Pure access-control rules (trial / paid plan / company ativo).
 * Extracted from useAccessControl for unit tests (Epic 12).
 */

export type AccessProfileInput = {
  trial: string | null;
  company_id: string | null;
  created_at: string | null;
  status: string | null;
  plano_ativo: string | null;
};

export type AccessEvaluation = {
  trial: string | null;
  companyStatus: boolean;
  authorized: boolean;
  authorizationReason: string | null;
  isTrial: boolean;
  createdAt: string | null;
  trialExpiresAt: string | null;
};

const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

export function evaluateAccessControl(
  profile: AccessProfileInput | null | undefined,
  companyAtivo: boolean,
  nowMs: number = Date.now(),
): AccessEvaluation {
  if (!profile) {
    return {
      trial: null,
      companyStatus: false,
      authorized: false,
      authorizationReason: null,
      isTrial: false,
      createdAt: null,
      trialExpiresAt: null,
    };
  }

  const trialStartedAt = profile.created_at ? new Date(profile.created_at).getTime() : 0;
  const trialExpiresAtMs = trialStartedAt + TRIAL_MS;
  const isTrial = profile.trial === "ativo" && nowMs < trialExpiresAtMs;
  const hasPaidPlan = profile.status === "ativo" && !!profile.plano_ativo;
  const authorized = isTrial || companyAtivo === true || hasPaidPlan;

  let authorizationReason: string | null = null;
  if (!authorized) {
    if (!profile.company_id) {
      authorizationReason = "onboarding_incomplete";
    } else if (profile.plano_ativo && profile.status !== "ativo") {
      authorizationReason = "payment_pending";
    } else {
      authorizationReason = "trial_expired";
    }
  }

  return {
    trial: profile.trial,
    companyStatus: companyAtivo,
    authorized,
    authorizationReason,
    isTrial,
    createdAt: profile.created_at,
    trialExpiresAt: profile.created_at ? new Date(trialExpiresAtMs).toISOString() : null,
  };
}
