import { useState } from 'react';
import { Filter, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStatusFilter } from '../hooks/useStatusFilter';

export default function StatusFilter() {
  // UI state only
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  // All data logic in custom hook
  const { currentStatus, currentStatusObject, statuses, handleStatusChange } = useStatusFilter();

  const handleChange = (value: string) => {
    handleStatusChange(value);
    setIsOpen(false); // UI concern - close dropdown
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };



  return (
    <div className="relative">
      {/* Custom Dropdown Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          borderRadius: '16px',
          padding: '12px 16px',
        }}
        className={`input-modern w-full flex items-center justify-between text-sm font-medium transition-all duration-200 ${
          focused || isOpen
            ? 'ring-2 ring-purple-500 ring-opacity-50 border-purple-500 shadow-glow'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Filter
            className={`w-5 h-5 transition-colors duration-200 ${
              focused || isOpen ? 'text-purple-500' : 'text-gray-400'
            }`}
          />
          <span className="text-gray-700">Filter by Status</span>
          {currentStatus && (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                currentStatus
              )}`}
            >
              {currentStatusObject.label}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Floating Label */}
      <AnimatePresence>
        {(focused || isOpen) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-2 left-3 px-2 bg-white text-xs font-medium text-purple-600"
          >
            Filter Orders
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 shadow-2xl z-[100] overflow-hidden max-h-64 overflow-y-auto"
            style={{
              borderRadius: '16px',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            {statuses.map((status, index) => (
              <div key={status.value}>
                <motion.button
                  whileHover={{ backgroundColor: '#f8fafc' }}
                  onClick={() => handleChange(status.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius:
                      index === 0
                        ? '16px 16px 0 0'
                        : index === statuses.length - 1
                        ? '0 0 16px 16px'
                        : '0',
                  }}
                  className="w-full flex items-center justify-between text-sm font-medium text-left hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor:
                          status.value === 'pending'
                            ? '#fbbf24'
                            : status.value === 'approved'
                            ? '#22c55e'
                            : status.value === 'rejected'
                            ? '#ef4444'
                            : status.value === 'cancelled'
                            ? '#6b7280'
                            : '#9ca3af',
                      }}
                    ></div>
                    <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                      {status.label}
                    </span>
                  </div>
                  {currentStatus === status.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#f3e8ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check className="w-3 h-3 text-purple-600" />
                    </motion.div>
                  )}
                </motion.button>
                {index < statuses.length - 1 && (
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: '#f3f4f6',
                      margin: '0 16px',
                    }}
                  ></div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
