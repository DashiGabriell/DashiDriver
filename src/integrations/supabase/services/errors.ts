/** Normalize Supabase/Postgrest errors into a stable Error for UI toasts. */
export function toServiceError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error && error.message) {
    return error;
  }

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message
      : fallbackMessage;

  return new Error(message || fallbackMessage);
}

export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado.") {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
