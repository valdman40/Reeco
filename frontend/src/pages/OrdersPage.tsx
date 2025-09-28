import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrders } from '../hooks/useOrders';
import SearchInput from '../components/SearchInput';
import StatusFilter from '../components/StatusFilter';
import OrdersTable from '../components/OrdersTable';
import Pagination from '../components/Pagination';
import OrderDetail from '../components/OrderDetail';

export default function OrdersPage() {
  const [params] = useSearchParams();
  const page = Number(params.get('page') ?? '1');
  const q = params.get('q') ?? undefined;
  const status = params.get('status') ?? undefined;
  const limit = 20;
  const { data, isLoading, isError } = useOrders({ page, limit, q, status });

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
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
                  <div className="w-20 h-20 border-4 border-purple-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                </div>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-gray-600 mt-6 text-lg font-medium"
                >
                  Loading your orders...
                </motion.p>
              </motion.div>
            )}

            {isError && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-red-50 via-red-50 to-pink-50 border border-red-200 rounded-2xl p-8"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold text-red-800 mb-2">
                      Error Loading Orders
                    </h3>
                    <p className="text-red-600">
                      There was a problem loading your orders. Please try again.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {data && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <OrdersTable items={data.items} />
                <div className="mt-8">
                  <Pagination total={data.total} limit={data.limit} />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
