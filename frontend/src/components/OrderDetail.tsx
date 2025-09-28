import { useSearchParams } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Hash,
  Package,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetail() {
  const [params, setParams] = useSearchParams();
  const id = params.get('id');
  const { data, isLoading } = useOrder(id ?? '');

  const closePanel = () => {
    const newParams = new URLSearchParams(params);
    newParams.delete('id');
    setParams(newParams);
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5" />,
          badge:
            'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200',
          color: 'yellow',
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          badge:
            'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
          color: 'green',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5" />,
          badge:
            'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200',
          color: 'red',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          badge:
            'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200',
          color: 'gray',
        };
    }
  };

  if (!id) return null;

  return (
    <AnimatePresence>
      {id && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="inset-y-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden border-l-4 border-gray-300"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Order Details
                      </h2>
                      <p className="text-purple-100 text-sm">
                        #{id?.slice(-8)}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closePanel}
                    className="p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8"
                  >
                    <div className="space-y-6">
                      {/* Header Skeleton */}
                      <div className="animate-pulse space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                          <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </div>

                      {/* Content Skeleton */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isLoading && !data && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 text-center"
                  >
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Order Not Found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      The order you're looking for doesn't exist or may have
                      been removed.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closePanel}
                      className="button-modern"
                    >
                      Go Back
                    </motion.button>
                  </motion.div>
                )}

                {!isLoading && data && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-10 space-y-12"
                  >
                    {/* Customer Header */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          {data.customer.charAt(0).toUpperCase()}
                        </div>
                        <div
                          className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white shadow-lg ${
                            getStatusConfig(data.status).color === 'green'
                              ? 'bg-green-500'
                              : getStatusConfig(data.status).color === 'yellow'
                              ? 'bg-yellow-500'
                              : getStatusConfig(data.status).color === 'red'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                          }`}
                        ></div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {data.customer}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${
                              getStatusConfig(data.status).badge
                            }`}
                          >
                            {getStatusConfig(data.status).icon}
                            <span className="capitalize">{data.status}</span>
                          </span>
                          <span className="text-sm text-gray-500">
                            #{data.id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Order Information */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="card-modern rounded-2xl p-8"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <Hash className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-gray-900">
                            Order Information
                          </h4>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Order ID</span>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              #{data.id.slice(-8)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Created</span>
                            <span className="font-medium">
                              {format(
                                new Date(data.createdAt),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Items Count</span>
                            <span className="font-bold text-purple-600">
                              {data.lineItemCount || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Financial Details */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="card-modern rounded-2xl p-8"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-gray-900">
                            Financial Details
                          </h4>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="text-2xl font-bold text-green-600">
                              ${data.total.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                              Approval Status
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                data.isApproved
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {data.isApproved
                                ? 'Approved'
                                : 'Pending Approval'}
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Customer Details */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="card-modern rounded-2xl p-8"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <User className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">
                            Customer Details
                          </h4>
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Name</span>
                            <span className="font-medium">{data.customer}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Ordered By</span>
                            <span className="font-medium">Order Team</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Outlet</span>
                            <span className="font-medium">General</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Raw Data */}
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="card-modern rounded-2xl p-8"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <h4 className="font-semibold text-gray-900">
                            Raw Data
                          </h4>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 overflow-auto max-h-48">
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                            {JSON.stringify(data, null, 2)}
                          </pre>
                        </div>
                      </motion.div>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex space-x-4 pt-6 border-t border-gray-200"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 button-modern"
                      >
                        Edit Order
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                      >
                        Download PDF
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
