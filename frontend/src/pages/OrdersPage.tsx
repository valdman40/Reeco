import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useOrders } from '../hooks/useOrders';
import SearchInput from '../components/SearchInput';
import StatusFilter from '../components/StatusFilter';
import OrdersTable from '../components/OrdersTable';
import Pagination from '../components/Pagination';
import OrderDetail from '../components/OrderDetail';
import ErrorDisplay from '../components/common/ErrorDisplay';
import LoadingMessage from '../components/common/LoadingMessage';

export default function OrdersPage() {
  const [params] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const q = params.get('q') ?? undefined;
  const status = params.get('status') ?? undefined;
  const limit = 20;
  
  // Memoize query params to prevent unnecessary refetches
  const queryParams = useMemo(() => ({
    page,
    limit,
    q,
    status,
  }), [page, limit, q, status]);
  
  const { data, isLoading, isError, error } = useOrders(queryParams);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div style={{ maxWidth: '1280px' }} className="mx-auto px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <p className="text-gray-600">
            Track and manage all your orders efficiently
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <div style={{ maxWidth: '30%' }}>
            <SearchInput />
          </div>
        </motion.div>

        {/* Filter Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ maxWidth: '30%' }}>
            <StatusFilter />
          </div>
        </motion.div>

        <div style={{ marginTop: '2rem' }}>
          <OrderDetail />
        </div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card-modern rounded-2xl"
          style={{ marginBottom: '2rem' }}
        >
          <div className="p-8">
            
            {isLoading && <LoadingMessage message="Loading your orders..." />}

            {isError && (
              <ErrorDisplay
                title="Error Loading Orders"
                message={
                  error instanceof Error
                    ? error.message
                    : 'There was a problem loading your orders. Please try again.'
                }
              />
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Pagination total={data?.total || 0} limit={data?.limit || limit} />
              <OrdersTable items={data?.items || []} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
