import { useState, useEffect } from 'react';

const useScrollDirection = (threshold = 10) => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let scrollTimeout;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      if (direction !== scrollDirection && Math.abs(scrollY - lastScrollY) > threshold) {
        setScrollDirection(direction);
      }
      
      setIsScrolling(true);
      
      // Очищуємо попередній таймер
      clearTimeout(scrollTimeout);
      
      // Встановлюємо новий таймер
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
      
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection);
    
    return () => {
      window.removeEventListener('scroll', updateScrollDirection);
      clearTimeout(scrollTimeout);
    };
  }, [scrollDirection, threshold]);

  return { scrollDirection, isScrolling };
};

export default useScrollDirection;