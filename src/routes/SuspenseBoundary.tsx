import { Suspense, type ReactNode } from "react";
import { RouteFallback } from "@/routes/fallback";

export function SuspenseBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}
