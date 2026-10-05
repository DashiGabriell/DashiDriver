import { useAccessControl } from "@/hooks/useAccessControl";
import { Badge } from "@/components/ui/badge";

export function TrialCounter() {
  const { data, isLoading } = useAccessControl();

  if (isLoading || !data?.isTrial || !data?.createdAt) return null;

  const startDate = new Date(data.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = 7 - diffDays;

  if (daysRemaining <= 0) return null;

  return (
    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
      Trial: {daysRemaining} dia{daysRemaining > 1 ? 's' : ''} restantes
    </Badge>
  );
}
