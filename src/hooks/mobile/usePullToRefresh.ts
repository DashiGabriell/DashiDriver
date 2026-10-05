import { useState, useCallback, useEffect } from 'react';

/**
 * Hook para lógica de Pull to Refresh.
 */
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handlePull = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh]);

  return { isRefreshing, pullDistance, setPullDistance, handlePull };
};
