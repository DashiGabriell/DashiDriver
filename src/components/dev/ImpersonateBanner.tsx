import { useImpersonate } from '@/hooks/dev/useImpersonate';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function ImpersonateBanner() {
  const { getImpersonateInfo, stopImpersonating, isImpersonating } = useImpersonate();

  if (!isImpersonating) return null;

  const info = getImpersonateInfo();

  return (
    <div className="sticky top-0 z-[60] w-full bg-amber-600 text-amber-50 px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <User className="w-4 h-4 shrink-0" />
        <span className="truncate">
          Personificando <strong>{info?.nome || info?.email}</strong>
          {info?.nome && info?.email && (
            <span className="hidden sm:inline"> ({info.email})</span>
          )}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-amber-50 hover:text-amber-100 hover:bg-amber-700 shrink-0"
        onClick={stopImpersonating}
      >
        <LogOut className="w-4 h-4 mr-1" />
        Sair
      </Button>
    </div>
  );
}
