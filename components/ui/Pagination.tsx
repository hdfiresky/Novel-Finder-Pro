
import React, { useState, useEffect } from 'react';
import Icon from '../Icon';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

    // Large screens (md and up)
    if (width >= 768) {
      if (totalPages <= 7) {
        return range(1, totalPages);
      }
      const showLeftDots = currentPage > 4;
      const showRightDots = currentPage < totalPages - 3;
      if (!showLeftDots && showRightDots) return [1, 2, 3, 4, 5, '...', totalPages];
      if (showLeftDots && !showRightDots) return [1, '...', ...range(totalPages - 4, totalPages)];
      if (showLeftDots && showRightDots) return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
    
    // Medium screens (sm)
    if (width >= 640) {
      if (totalPages <= 5) {
        return range(1, totalPages);
      }
      const showLeftDots = currentPage > 3;
      const showRightDots = currentPage < totalPages - 2;
      if (!showLeftDots && showRightDots) return [1, 2, 3, '...', totalPages];
      if (showLeftDots && !showRightDots) return [1, '...', ...range(totalPages - 2, totalPages)];
      if (showLeftDots && showRightDots) return [1, '...', currentPage, '...', totalPages];
    }

    // Small screens (xs)
    if (totalPages <= 4) {
      return range(1, totalPages);
    }
    if (currentPage <= 2) return [1, 2, '...', totalPages];
    if (currentPage >= totalPages - 1) return [1, '...', totalPages - 1, totalPages];
    return [1, '...', currentPage, '...', totalPages];
  };

  const pages = getPageNumbers();
  
  if (!pages) return null; // Should not happen if totalPages > 1

  return (
    <nav className="flex items-center justify-center gap-1 sm:gap-2 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name="ChevronLeft" size={20} />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (typeof page === 'string') {
            return <span key={`ellipsis-${index}`} className="px-1 sm:px-2 py-2 text-gray-500 text-xs sm:text-base">...</span>;
          }
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 sm:w-10 sm:h-10 text-sm font-medium rounded-md transition-colors ${
                currentPage === page
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              aria-current={currentPage === page ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name="ChevronRight" size={20} />
      </button>
    </nav>
  );
};

export default Pagination;
