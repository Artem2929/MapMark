import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants';

/**
 * Custom hook for media queries
 * @param {string} query - Media query string
 * @returns {boolean} Whether the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Hook for common breakpoint queries
 * @returns {object} Breakpoint states
 */
export function useBreakpoints() {
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.SM}px)`);
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.MD}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.LG}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.XL}px)`);
  const is2Xl = useMediaQuery(`(min-width: ${BREAKPOINTS['2XL']}px)`);

  const isMobile = !isMd;
  const isTablet = isMd && !isLg;
  const isDesktop = isLg;

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * Hook for detecting touch devices
 * @returns {boolean} Whether device supports touch
 */
export function useIsTouchDevice() {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

/**
 * Hook for detecting reduced motion preference
 * @returns {boolean} Whether user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook for detecting high contrast preference
 * @returns {boolean} Whether user prefers high contrast
 */
export function usePrefersHighContrast() {
  return useMediaQuery('(prefers-contrast: high)');
}