interface ResultsSummaryProps {
  total: number;
  currentPage: number;
  limit: number;
  searchQuery?: string;
  statusFilter?: string;
}

export default function ResultsSummary({ 
  total, 
  currentPage, 
  limit, 
  searchQuery, 
  statusFilter 
}: ResultsSummaryProps) {
  
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="mb-6">
      <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl inline-block">
        <p className="text-sm font-medium text-purple-700">
          {total > 0 ? (
            <span>
              Showing <span className="font-bold">{startItem}-{endItem}</span>{' '}
              of <span className="font-bold">{total}</span> orders
              {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
              {statusFilter && <span> with status "<strong>{statusFilter}</strong>"</span>}
            </span>
          ) : (
            <span>No orders found</span>
          )}
        </p>
      </div>
    </div>
  );
}