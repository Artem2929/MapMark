import React, {  useState, useEffect , useCallback, useMemo, memo } from 'react';
import { classNames } from '../../utils/classNames';
import './ScrollToTop.css';

const ScrollToTop = memo(({  threshold = 300  }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      className={`scroll-to-top ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Прокрутити вгору"
    >
      ↑
    </button>
  );
});

ScrollToTop.displayName = 'ScrollToTop';

export default ScrollToTop;