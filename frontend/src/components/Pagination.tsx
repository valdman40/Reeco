import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export default function Pagination({
  total,
  limit,
}: {
  total: number;
  limit: number;
}) {
  const [params, set] = useSearchParams();
  const p = Number(params.get('page') ?? '1');
  const max = Math.ceil(total / limit);

  function goTo(n: number) {
    params.set('page', String(n));
    set(params);
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Show max 5 page buttons

    if (max <= showPages) {
      // Show all pages if total is small
      for (let i = 1; i <= max; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (p <= 3) {
        pages.push(1, 2, 3, 4, '...', max);
      } else if (p >= max - 2) {
        pages.push(1, '...', max - 3, max - 2, max - 1, max);
      } else {
        pages.push(1, '...', p - 1, p, p + 1, '...', max);
      }
    }

    return pages;
  };

  if (max <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8">
      {/* Mobile Pagination */}
      <div className="flex flex-1 justify-between sm:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={p <= 1}
          onClick={() => goTo(p - 1)}
          className="button-modern disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={p >= max}
          onClick={() => goTo(p + 1)}
          className="button-modern disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </motion.button>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
            <p className="text-sm font-medium text-purple-700">
              Showing <span className="font-bold">{(p - 1) * limit + 1}</span>{' '}
              to <span className="font-bold">{Math.min(p * limit, total)}</span>{' '}
              of <span className="font-bold">{total}</span> orders
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => goTo(p - 1)}
            disabled={p <= 1}
            className="p-3 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((pageNum, index) => (
              <motion.div key={`${pageNum}-${index}`}>
                {pageNum === '...' ? (
                  <div className="px-3 py-2 text-gray-400">
                    <MoreHorizontal className="w-5 h-5" />
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => goTo(pageNum as number)}
                    className={`w-12 h-12 rounded-xl font-semibold transition-all duration-200 ${
                      p === pageNum
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Next Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => goTo(p + 1)}
            disabled={p >= max}
            className="p-3 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
