import { useSearchParams } from 'react-router-dom';
import NextPrevButton from './common/buttons/NextPrevButton';
import ResultsSummary from './ResultsSummary';

export default function Pagination({ total = 0, limit = 6 }: { total: number; limit: number }) {
  const [params, set] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const max = Math.ceil(total / limit);

  function goTo(n: number) {
    params.set('page', String(n));
    set(params);
  }

  if (max <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8">
      <div className="flex flex-1 justify-between">
        <NextPrevButton type="prev" disabled={page <= 1} onClick={() => goTo(page - 1)} />
        <ResultsSummary total={total} currentPage={page} limit={limit} />
        <NextPrevButton type="next" disabled={page >= max} onClick={() => goTo(page + 1)} />
      </div>
    </div>
  );
}
