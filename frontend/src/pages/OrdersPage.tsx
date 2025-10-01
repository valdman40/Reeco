import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Modal } from 'antd';
import { useOrders } from '../hooks/useOrders';
import SearchInput from '../components/SearchInput';
import StatusFilter from '../components/StatusFilter';
import OrdersTable from '../components/OrdersTable';
import Pagination from '../components/Pagination';
import OrderDetail from '../components/OrderDetail';
import ErrorDisplay from '../components/common/ErrorDisplay';
import LoadingMessage from '../components/common/LoadingMessage';
import Button from '../components/common/buttons/Button';

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const q = params.get('q') ?? undefined;
  const status = params.get('status') ?? undefined;
  const orderId = params.get('id') ?? undefined;
  const limit = 6;
  
  // Include sort parameter for server-side sorting
  const sort = params.get('sort') ?? 'createdAt:desc';
  
  // Memoize query params to prevent unnecessary refetches
  const queryParams = useMemo(() => ({
    page,
    limit,
    q,
    status,
    sort,  // ← Now included in server request!
  }), [page, limit, q, status, sort]);
  
  const { data, isLoading, isError, error, refetch } = useOrders(queryParams);

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

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-8"
          style={{ marginBottom: '2rem' }}
        >
          <div>
            
            {isLoading && <LoadingMessage message="Loading your orders..." />}
            {isError && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Button
                    onClick={() => refetch()}
                    variant="secondary"
                    style={{ width: '200px' }}
                  >
                    🔄 Retry
                  </Button>
                </div>
                <ErrorDisplay
                  title="Error Loading Orders"
                  message={
                    error instanceof Error
                      ? error.message
                      : 'There was a problem loading your orders. Please try again.'
                  }
                />
              </>
            )}

            {!isError && (!data?.items && !isLoading) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Pagination total={data?.total || 0} limit={data?.limit || limit} />
                <OrdersTable items={data?.items || []} />
                <Pagination total={data?.total || 0} limit={data?.limit || limit} />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Modal for Order Detail */}
        <Modal
          title="Order Details"
          open={!!orderId}
          onCancel={() => {
            const newParams = new URLSearchParams(params);
            newParams.delete('id');
            setParams(newParams);
          }}
          footer={null}
          width={800}
          styles={{
            body: { padding: 0 },
          }}
        >
          {orderId && <OrderDetail orderId={orderId} />}
        </Modal>
      </div>
    </div>
  );
}
