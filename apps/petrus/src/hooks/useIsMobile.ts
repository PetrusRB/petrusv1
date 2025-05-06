import { useEffect, useMemo, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";

// Breakpoints for responsive design
const BREAKPOINTS = {
  mobile: 768, // <768px is mobile
  desktop: 768, // ≥768px is desktop
};

// Custom hook to detect mobile vs desktop
export const useIsMobile = () => {
  const { width } = useWindowDimensions();
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof width === 'number' ? width < BREAKPOINTS.mobile : true // Fallback to mobile for SSR
  );

  useEffect(() => {
    // Update isMobile based on window width
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
    };

    // Debounce resize events (web only)
    if (Platform.OS === 'web') {
      let timeout: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(timeout);
        timeout = setTimeout(updateIsMobile, 100); // Debounce by 100ms
      };

      window.addEventListener('resize', handleResize);
      updateIsMobile(); // Initial check

      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeout);
      };
    } else {
      // React Native: Use useWindowDimensions directly
      setIsMobile(width < BREAKPOINTS.mobile);
    }
  }, [width]);

  return useMemo(() => isMobile, [isMobile]);
};