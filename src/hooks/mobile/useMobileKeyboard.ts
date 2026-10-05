import { useState, useEffect } from 'react';

/**
 * Hook para detectar o estado do teclado mobile e ajustar o layout.
 */
export const useMobileKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      // Diferença entre a altura da janela visual e a altura total do documento
      // Se a diferença for significativa, o teclado provavelmente está aberto.
      if (window.visualViewport) {
        const isOpen = window.visualViewport.height < window.innerHeight * 0.85;
        setIsKeyboardOpen(isOpen);
        setKeyboardHeight(isOpen ? window.innerHeight - window.visualViewport.height : 0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return { isKeyboardOpen, keyboardHeight };
};
