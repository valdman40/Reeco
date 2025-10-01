import { useSearchParams } from 'react-router-dom';

export function usePagination() {
  const [params, set] = useSearchParams();

  const currentPage = Number(params.get('page') ?? '1');

  const goToPage = (pageNumber: number) => {
    const newParams = new URLSearchParams(params);
    newParams.set('page', String(pageNumber));
    set(newParams);
  };

  const goToNextPage = (totalPages: number) => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    currentPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
  };
}
