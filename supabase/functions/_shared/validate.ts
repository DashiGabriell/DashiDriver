import { z } from "https://esm.sh/zod@3.25.76";

type CorsHeaders = Record<string, string>;

export function validationErrorResponse(
  error: z.ZodError,
  corsHeaders: CorsHeaders,
): Response {
  return new Response(
    JSON.stringify({
      error: "Dados invalidos",
      details: error.issues.map((issue) => ({
        path: issue.path.join(".") || "(root)",
        message: issue.message,
      })),
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}

export function parseJsonBody<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  corsHeaders: CorsHeaders,
): { ok: true; data: T } | { ok: false; response: Response } {
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { ok: false, response: validationErrorResponse(result.error, corsHeaders) };
  }
  return { ok: true, data: result.data };
}

export async function readAndParseJsonBody<T>(
  req: Request,
  schema: z.ZodType<T>,
  corsHeaders: CorsHeaders,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: "Corpo da requisicao invalido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      ),
    };
  }
  return parseJsonBody(schema, raw, corsHeaders);
}
