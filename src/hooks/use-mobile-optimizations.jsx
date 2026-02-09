import { useEffect, useState } from 'react';

export function useMobileOptimizations() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkMobile);

    // Check connection speed (simplified)
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection && connection.effectiveType) {
        const updateConnectionStatus = () => {
          setIsSlowConnection(
            connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g' || 
            connection.effectiveType === '3g'
          );
        };
        
        updateConnectionStatus();
        connection.addEventListener('change', updateConnectionStatus);
        
        return () => {
          window.removeEventListener('resize', checkMobile);
          connection.removeEventListener('change', updateConnectionStatus);
        };
      }
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return {
    isMobile,
    isSlowConnection,
    shouldReduceMotion: isMobile || isSlowConnection,
    shouldReduceData: isSlowConnection,
  };
}
