import { useEffect, useState } from 'react';

export function useMobileOptimizations() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check connection speed
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const updateConnectionStatus = () => {
          // 3G or slower
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
