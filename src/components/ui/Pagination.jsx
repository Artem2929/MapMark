import React, { memo } from 'react';
import { classNames } from '../../utils/classNames';
import Button from './Button.optimized';
import './Pagination.css';

const Pagination = memo(({  
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  className = '',
  ...props 
 }) => {
  if (totalPages <= 1) return null;

Pagination.displayName = 'Pagination';

  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`pagination ${className}`} {...props}>
      <Button
        variant="secondary"
        size="medium"
        disabled={currentPage === 1}
        onClick={useCallback(() => onPageChange(currentPage - 1), [])}
        className="pagination__nav"
      >
        ← Попередня
      </Button>
      
      <div className="pagination__numbers">
        {visiblePages.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? 'primary' : 'secondary'}
            size="medium"
            onClick={useCallback(() => onPageChange(page), [])}
            className="pagination__number"
          >
            {page}
          </Button>
        ))}
      </div>
      
      <Button
        variant="secondary"
        size="medium"
        disabled={currentPage === totalPages}
        onClick={useCallback(() => onPageChange(currentPage + 1), [])}
        className="pagination__nav"
      >
        Наступна →
      </Button>
    </div>
  );
};

export default Pagination;