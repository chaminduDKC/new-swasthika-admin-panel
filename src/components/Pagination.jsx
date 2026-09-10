import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  onLimitChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-stone-200">
      {/* Left: Summary & Per-Page Selector */}
      <div className="flex items-center gap-3 text-xs text-stone-500 order-2 sm:order-1">
        <span>
          Showing <strong className="text-stone-800 font-semibold">{startItem}–{endItem}</strong> of{' '}
          <strong className="text-stone-800 font-semibold">{totalItems}</strong> photos
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-stone-200">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:ring-1 focus:ring-gold-500 outline-none"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={36}>36</option>
              <option value={48}>48</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 order-1 sm:order-2">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First Page"
            className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-gold-50 hover:text-gold-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
            className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-gold-50 hover:text-gold-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Number Buttons */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-xs text-stone-400 select-none">
                    ...
                  </span>
                );
              }

              const isCurrent = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-gold-600 text-white shadow-xs border border-gold-700'
                      : 'border border-stone-200 bg-white text-stone-700 hover:bg-gold-50 hover:text-gold-900 hover:border-gold-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next Page"
            className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-gold-50 hover:text-gold-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Last Page"
            className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-gold-50 hover:text-gold-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
