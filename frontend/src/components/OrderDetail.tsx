import { useOrder } from '../hooks/useOrder';
import { motion } from 'framer-motion';
import { User, Hash, Package, DollarSign, FileText, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from './common/StatusBadge';
import Button from './common/buttons/Button';

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  let { data, isLoading } = useOrder(orderId);

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-6 rounded-t-lg mb-6"
      >
        <div className="flex items-center space-x-4" style={{gap: '1rem'}} >
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Order Details</h2>
          <span className="text-purple-100 text-sm">#{orderId?.slice(-8)}</span>
        </div>
      </motion.div>

      {/* Content */}
      <div>
        {!isLoading && !data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or may have been removed.</p>
          </motion.div>
        )}

        {!isLoading && data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-10"
          >
            <div className="flex flex-col" style={{ gap: '3rem' }}>
              {/* Customer Header */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{data.customer}</h3>
                <div className="flex items-center" style={{ gap: '1rem' }}>
                  <StatusBadge status={data.status} />
                  <span className="text-sm text-gray-500">#{data.id.slice(-8)}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto" style={{ maxHeight: '20rem' }}>
                {/* Order Information */}
                <motion.div whileHover={{ y: -2 }} className="card-modern rounded-2xl p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <Hash className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Order Information</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Order ID</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">#{data.id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium">{format(new Date(data.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Items Count</span>
                      <span className="font-bold text-purple-600">{data.lineItemCount || 'N/A'}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Financial Details */}
                <motion.div whileHover={{ y: -2 }} className="card-modern rounded-2xl p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Financial Details</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">${data.total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Approval Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          data.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {data.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Customer Details */}
                <motion.div whileHover={{ y: -2 }} className="card-modern rounded-2xl p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Customer Details</h4>
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
                <motion.div whileHover={{ y: -2 }} className="card-modern rounded-2xl p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Raw Data</h4>
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
                className="flex space-x-4 pt-6"
              >
                <Button variant="primary"> Edit Order </Button>
                <Button variant="secondary"> Download PDF </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
