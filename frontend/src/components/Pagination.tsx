import NextPrevButton from './common/buttons/NextPrevButton';
import ResultsSummary from './ResultsSummary';
import { usePagination } from '../hooks/usePagination';

export default function Pagination({ total = 0, limit = 6 }: { total: number; limit: number }) {
  // All data logic moved to custom hook
  const { currentPage, goToNextPage, goToPrevPage } = usePagination();
  
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8">
      <div className="flex flex-1 justify-between">
        <NextPrevButton type="prev" disabled={!hasPrevPage} onClick={goToPrevPage} />
        <ResultsSummary total={total} currentPage={currentPage} limit={limit} />
        <NextPrevButton type="next" disabled={!hasNextPage} onClick={() => goToNextPage(totalPages)} />
      </div>
    </div>
  );
}
