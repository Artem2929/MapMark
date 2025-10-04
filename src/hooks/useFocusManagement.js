import { useRef, useEffect } from 'react';

/**
 * Hook for managing focus trap in modals/dialogs
 * @param {boolean} isActive - Whether focus trap is active
 * @returns {React.RefObject} Ref to attach to container element
 */
export function useFocusTrap(isActive = false) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap activates
    if (firstElement) {
      firstElement.focus();
    }

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for auto-focusing an element when component mounts
 * @param {boolean} shouldFocus - Whether to auto-focus
 * @returns {React.RefObject} Ref to attach to element
 */
export function useAutoFocus(shouldFocus = true) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      // Small delay to ensure element is rendered
      const timeoutId = setTimeout(() => {
        elementRef.current?.focus();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldFocus]);

  return elementRef;
}

/**
 * Hook for restoring focus to previous element
 * @param {boolean} isActive - Whether to track focus
 * @returns {function} Function to restore focus
 */
export function useFocusRestore(isActive = true) {
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement;
    }
  }, [isActive]);

  const restoreFocus = () => {
    if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
      previousActiveElement.current.focus();
    }
  };

  return restoreFocus;
}

/**
 * Hook for managing focus within a specific container
 * @param {boolean} isActive - Whether focus management is active
 * @returns {object} Focus management utilities
 */
export function useFocusManagement(isActive = true) {
  const containerRef = useRef(null);
  const restoreFocus = useFocusRestore(isActive);

  const focusFirst = () => {
    if (!containerRef.current) return;

    const firstFocusable = containerRef.current.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    firstFocusable?.focus();
  };

  const focusLast = () => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const lastFocusable = focusableElements[focusableElements.length - 1];
    lastFocusable?.focus();
  };

  return {
    containerRef,
    focusFirst,
    focusLast,
    restoreFocus,
  };
}