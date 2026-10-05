import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "../_shared/rate-limit.ts";

const ALLOWED_ORIGINS = [
  "https://dashidrive.com",
  "https://dashidrive.com.br",
  "http://localhost:8080",
];

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin":
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const BRUTE_FORCE_THRESHOLD = 10;
const SIGNUP_FLOOD_THRESHOLD = 50;
const SUSPICIOUS_USER_AGENTS = new Set([
  "python-requests", "curl", "wget", "go-http-client", "scrapy",
]);

function getSecretKey(): string {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_ANON_KEY") ?? "";
}

async function createScanLog(
  supabaseAdmin: ReturnType<typeof createClient>,
): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin
      .from("security_scan_log")
      .insert({
        triggered_by: "manual",
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("id");

    if (error) {
      console.error("createScanLog error:", error.message, error.details, error.hint);
      return "";
    }
    const id = data?.[0]?.id;
    console.log("createScanLog success id:", id ?? "MISSING");
    return typeof id === "string" ? id : "";
  } catch (err) {
    console.error("createScanLog exception:", String(err));
    return "";
  }
}

async function sendDiscordAlert(
  bruteForceIps: Array<{ ip: string; failures: number }>,
  signupFloodIps: Array<{ ip: string; signups: number }>,
  anomalies: Array<{ type: string; user_id: string; detail: string }>,
  blocksInserted: number,
  usersDisabled: number,
  auditLogsAnalyzed: number,
): Promise<void> {
  const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL not configured, skipping Discord alert");
    return;
  }

  const totalThreats = bruteForceIps.length + signupFloodIps.length + anomalies.length;
  const totalActions = blocksInserted + usersDisabled;
  const color = totalThreats > 0 ? 0xED4245 : (totalActions > 0 ? 0xFEE75C : 0x57F287);
  const status = totalThreats > 0
    ? "🚨 AMEAÇAS DETECTADAS"
    : totalActions > 0
      ? "⚠️ Atenção"
      : "✅ Nenhuma ameaça";

  const fields: Array<{ name: string; value: string; inline: boolean }> = [];

  if (bruteForceIps.length > 0) {
    const lines = bruteForceIps
      .slice(0, 10)
      .map((b) => `\`${b.ip}\` — ${b.failures} falhas`)
      .join("\n");
    fields.push({
      name: `🔴 Brute Force (${bruteForceIps.length})`,
      value: lines || "Nenhum",
      inline: false,
    });
  }

  if (signupFloodIps.length > 0) {
    const lines = signupFloodIps
      .slice(0, 10)
      .map((b) => `\`${b.ip}\` — ${b.signups} cadastros`)
      .join("\n");
    fields.push({
      name: `⚠️ Signup Flood (${signupFloodIps.length})`,
      value: lines || "Nenhum",
      inline: false,
    });
  }

  if (anomalies.length > 0) {
    const tokenReplay = anomalies.filter((a) => a.type === "token_replay");
    const suspiciousAgents = anomalies.filter((a) => a.type === "suspicious_user_agent");
    const parts: string[] = [];
    if (tokenReplay.length > 0) {
      parts.push(`🔄 Token Replay: ${tokenReplay.length} usuário(s)`);
      for (const a of tokenReplay.slice(0, 5)) {
        parts.push(`  • \`${a.user_id.slice(0, 12)}...\` — ${a.detail.slice(0, 60)}`);
      }
    }
    if (suspiciousAgents.length > 0) {
      parts.push(`🤖 User Agent Suspeito: ${suspiciousAgents.length} ocorrência(s)`);
      for (const a of suspiciousAgents.slice(0, 5)) {
        parts.push(`  • \`${a.user_id.slice(0, 12)}...\` — ${a.detail.slice(0, 60)}`);
      }
    }
    fields.push({
      name: `🟡 Anomalias (${anomalies.length})`,
      value: parts.join("\n") || "Nenhuma",
      inline: false,
    });
  }

  if (blocksInserted > 0) {
    fields.push({
      name: "🛡️ IPs Bloqueados",
      value: `${blocksInserted} IP(s) adicionado(s) à denylist`,
      inline: false,
    });
  }

  if (usersDisabled > 0) {
    fields.push({
      name: "🚫 Usuários Desativados",
      value: `${usersDisabled} conta(s) desativada(s)`,
      inline: false,
    });
  }

  if (fields.length === 0) {
    fields.push({
      name: "Status",
      value: "Nenhuma ameaça detectada na varredura.",
      inline: false,
    });
  }

  fields.push({
    name: "📊 Resumo",
    value: `Logs analisados: ${auditLogsAnalyzed} | Bloqueios: ${blocksInserted} | Desativados: ${usersDisabled}`,
    inline: false,
  });

  const embed = {
    title: `🔒 Security Monitor — ${status}`,
    color,
    fields,
    footer: { text: "DashiDrive Security Monitor" },
    timestamp: new Date().toISOString(),
  };

  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error(
        `Failed to send Discord alert: HTTP ${resp.status} ${text.slice(0, 200)}`,
      );
    } else {
      console.log("Discord alert sent successfully");
    }
  } catch (err) {
    console.error(`Failed to send Discord alert: ${err}`);
  }
}

async function finishScanLog(
  supabaseUrl: string,
  secretKey: string,
  logId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!logId) return;
  const url = `${supabaseUrl}/rest/v1/security_scan_log?id=eq.${logId}`;
  console.log(`finishScanLog PATCH ${url}`);
  try {
    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
        "apikey": secretKey,
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        finished_at: new Date().toISOString(),
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`finishScanLog HTTP ${resp.status}: ${text.slice(0, 200)}`);
    } else {
      console.log("finishScanLog success");
    }
  } catch (err) {
    console.error("finishScanLog exception:", err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders(req.headers.get("origin")),
    });
  }

  try {
    const _secretKey = getSecretKey();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    if (!_secretKey) throw new Error("Secret key nao disponivel");

    const supabaseAdmin = createClient(supabaseUrl, _secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: { headers: { apikey: _secretKey } },
    });

    const scanLogId = await createScanLog(supabaseAdmin);
    console.log("createScanLog result id:", JSON.stringify(scanLogId));

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Token de autenticacao ausente");

    const jwt = authHeader.replace("Bearer ", "");

    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "apikey": _secretKey,
      },
    });

    if (!userResp.ok) {
      const body = await userResp.text();
      throw new Error(
        `Falha ao verificar usuario: ${userResp.status} ${body.slice(0, 120)}`,
      );
    }

    const userData: { id: string } = await userResp.json();
    const userId = userData.id;

    const { allowed, retryAfter } = await checkRateLimit(
      supabaseAdmin,
      `scan:${userId}`,
      RATE_LIMITS.securityScan.max,
      RATE_LIMITS.securityScan.windowSeconds,
    );
    if (!allowed) return rateLimitResponse(req.headers.get("origin"), retryAfter);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("carcontrol_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw new Error(`Erro ao buscar profile: ${profileError.message}`);
    }

    if (!profile || profile.role !== "dev") {
      throw new Error(
        `Acesso negado — role 'dev' required, atual: ${profile?.role ?? "none"}`,
      );
    }

    const auditResp = await fetch(
      `${supabaseUrl}/auth/v1/admin/audit?limit=1000`,
      { headers: { apikey: _secretKey } },
    );

    if (!auditResp.ok) {
      const body = await auditResp.text();
      throw new Error(
        `Falha ao buscar audit logs: ${auditResp.status} ${body.slice(0, 120)}`,
      );
    }

    const logs: Array<Record<string, unknown>> = await auditResp.json();

    const failedIps = new Map<string, number>();
    const signupIps = new Map<string, number>();
    const userActions = new Map<string, Array<Record<string, unknown>>>();

    for (const entry of logs) {
      const action = (entry.action ?? "") as string;
      const traits = (entry.traits ?? {}) as Record<string, string>;
      const ip = traits.ip_address ??
        (entry.ip_address as string | undefined) ?? "";
      const actor = (entry.actor_id ?? "") as string;

      if (action === "login_failure" || action === "login") {
        if (ip) failedIps.set(ip, (failedIps.get(ip) ?? 0) + 1);
      }

      if (action === "signup") {
        if (ip) signupIps.set(ip, (signupIps.get(ip) ?? 0) + 1);
      }

      if (actor) {
        const list = userActions.get(actor) ?? [];
        list.push(entry);
        userActions.set(actor, list);
      }
    }

    const blocks: Array<{
      ip_address?: string;
      user_id?: string;
      reason: string;
    }> = [];

    for (const [ip, count] of failedIps) {
      if (count >= BRUTE_FORCE_THRESHOLD) {
        blocks.push({
          ip_address: ip,
          reason: `Brute force: ${count} login failures in 1h (manual scan)`,
        });
      }
    }

    for (const [ip, count] of signupIps) {
      if (count >= SIGNUP_FLOOD_THRESHOLD) {
        if (!blocks.some((b) => b.ip_address === ip)) {
          blocks.push({
            ip_address: ip,
            reason: `Signup flood: ${count} signups in 1h (manual scan)`,
          });
        }
      }
    }

    const anomalies: Array<{
      type: string;
      user_id: string;
      detail: string;
    }> = [];

    for (const [userId, entries] of userActions) {
      const ipsSeen = new Set<string>();
      const agentsSeen = new Set<string>();

      for (const e of entries) {
        const t = (e.traits ?? {}) as Record<string, string>;
        const ip = t.ip_address ?? "";
        const agent = (t.user_agent ?? "").toLowerCase();

        if (ip) ipsSeen.add(ip);
        if (agent) {
          agentsSeen.add(agent);
          for (const sa of SUSPICIOUS_USER_AGENTS) {
            if (agent.includes(sa)) {
              anomalies.push({
                type: "suspicious_user_agent",
                user_id: userId,
                detail: `User-agent suspeito '${agent.slice(0, 50)}' para usuário ${userId.slice(0, 12)}`,
              });
              break;
            }
          }
        }
      }

      if (ipsSeen.size >= 3) {
        anomalies.push({
          type: "token_replay",
          user_id: userId,
          detail: `Token usado de ${ipsSeen.size} IPs diferentes: ${[...ipsSeen].join(", ")}`,
        });
      }
    }

    let insertedCount = 0;
    for (const block of blocks) {
      const payload: Record<string, string | undefined> = {
        ip_address: block.ip_address,
        reason: block.reason,
        blocked_by: "security_monitor_manual",
      };
      if (block.user_id) payload.user_id = block.user_id;

      const { error: insertError } = await supabaseAdmin
        .from("security_denylist")
        .insert(payload);

      if (!insertError) insertedCount++;
    }

    let usersDisabled = 0;
    for (const anomaly of anomalies) {
      if (anomaly.type === "token_replay" || anomaly.type === "suspicious_user_agent") {
        const userId = anomaly.user_id;
        const disableResp = await fetch(
          `${supabaseUrl}/auth/v1/admin/users/${userId}`,
          {
            method: "PUT",
            headers: {
              "apikey": _secretKey,
              "Authorization": `Bearer ${_secretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ban_duration: "none" }),
          },
        );
        if (disableResp.ok) {
          usersDisabled++;
          await supabaseAdmin
            .from("security_denylist")
            .insert({
              user_id: userId,
              reason: anomaly.detail,
              blocked_by: "security_monitor_manual",
            });
        } else {
          const text = await disableResp.text();
          console.error(`Failed to disable user ${userId.slice(0, 12)}: HTTP ${disableResp.status} ${text.slice(0, 120)}`);
        }
      }
    }

    const bruteForceIps = [...failedIps.entries()]
      .filter(([, c]) => c >= BRUTE_FORCE_THRESHOLD)
      .map(([ip, c]) => ({ ip, failures: c }));
    const signupFloodIps = [...signupIps.entries()]
      .filter(([, c]) => c >= SIGNUP_FLOOD_THRESHOLD)
      .map(([ip, c]) => ({ ip, signups: c }));

    await finishScanLog(supabaseUrl, _secretKey, scanLogId, {
      status: "completed",
      threats_detected: blocks.length + anomalies.length,
      blocks_inserted: insertedCount,
      audit_logs_analyzed: logs.length,
      summary: {
        brute_force_ips: bruteForceIps,
        signup_flood_ips: signupFloodIps,
        anomalies,
        users_disabled: usersDisabled,
      },
    });

    await sendDiscordAlert(
      bruteForceIps,
      signupFloodIps,
      anomalies,
      insertedCount,
      usersDisabled,
      logs.length,
    );

    return new Response(
      JSON.stringify({
        success: true,
        scan_timestamp: new Date().toISOString(),
        audit_logs_analyzed: logs.length,
        threats_detected: blocks.length + anomalies.length,
        blocks_inserted: insertedCount,
        users_disabled: usersDisabled,
        anomalies,
        brute_force_ips: bruteForceIps,
        scan_log_id: scanLogId,
      }),
      {
        headers: {
          ...corsHeaders(req.headers.get("origin")),
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error
      ? error.message
      : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: {
          ...corsHeaders(req.headers.get("origin")),
          "Content-Type": "application/json",
        },
      },
    );
  }
});
