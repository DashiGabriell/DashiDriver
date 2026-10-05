import { useCallback } from 'react';

/**
 * Hook para simular haptic feedback visual.
 * Em dispositivos reais, poderia usar a Vibration API ou bibliotecas nativas,
 * mas aqui focamos na resposta visual premium.
 */
export const useHaptics = () => {
  const trigger = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    // No navegador, podemos tentar usar a Vibration API se disponível
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 40,
        success: [10, 30, 10],
        warning: [20, 50, 20],
        error: [50, 100, 50, 100],
      };
      
      try {
        navigator.vibrate(patterns[type]);
      } catch (e) {
        // Ignora erros se o navegador bloquear vibração
      }
    }
  }, []);

  return { trigger };
};
