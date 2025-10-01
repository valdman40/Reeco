import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  User,
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  Check,
} from 'lucide-react';
import { Order } from '../types/order';
import StatusBadge from './common/StatusBadge';
import Button from './common/buttons/Button';
import { useOrderCard } from '../hooks/useOrderCard';

interface OrderCardProps {
  order: Order;
  index: number;
  isSelected?: boolean;
  onSelectionToggle?: (id: string) => void;
}

const OrderCard = React.forwardRef<HTMLDivElement, OrderCardProps>(({ order, index, isSelected = false, onSelectionToggle }, ref) => {
  // All business logic moved to custom hook
  const {
    handleOrderNavigation,
    handleApprove,
    isApproving,
    statusConfig,
    isCancelled,
    cardOpacity,
    isPending,
  } = useOrderCard(order);

  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionToggle?.(order.id);
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: cardOpacity, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
      }}
      whileHover={isCancelled ? {} : { y: -8, scale: 1.02 }}
      onClick={handleOrderNavigation}
      className="order-card"
      style={{
        opacity: cardOpacity,
        filter: isCancelled ? 'grayscale(20%)' : 'none',
        transition: 'opacity 0.2s ease, filter 0.2s ease',
      }}
    >
      <div className="flex flex-col" style={{ gap: '1.5rem' }}>
        {/* Header */}
        <div className="order-header">
          <div className="customer-info">
            <div className="customer-avatar">
              <div className="avatar-circle">
                {order.customer.charAt(0).toUpperCase()}
              </div>
              <div
                className={`status-indicator ${statusConfig.indicatorClass}`}
              ></div>
            </div>
            <div className="customer-details">
              <h4>{order.customer}</h4>
              <p>#{order.id.slice(-6)}</p>
            </div>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Selection Checkbox */}
            {onSelectionToggle && !isCancelled && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSelectionToggle}
                className={`selection-checkbox ${isSelected ? 'selected' : ''}`}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: isSelected ? '2px solid #10b981' : '2px solid #d1d5db',
                  backgroundColor: isSelected ? '#10b981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSelected && (
                  <Check 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      color: 'white',
                      strokeWidth: 3
                    }} 
                  />
                )}
              </motion.button>
            )}
            
            {/* Disabled checkbox for cancelled orders */}
            {onSelectionToggle && isCancelled && (
              <div
                className="selection-checkbox disabled"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                {/* Empty - no selection possible */}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="view-button"
              onClick={(e) => {
                e.stopPropagation();
                handleOrderNavigation();
              }}
            >
              <Eye style={{ width: '1rem', height: '1rem' }} />
            </motion.button>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <StatusBadge status={order.status} />
        </div>

        {/* Order Details */}
        <div className="order-details">
          <div className="order-detail-item">
            <Calendar style={{ width: '1rem', height: '1rem' }} />
            <span>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
          </div>

          <div className="order-detail-item">
            <User style={{ width: '1rem', height: '1rem' }} />
            <span>Order Team</span>
          </div>

          <div className="order-detail-item">
            <MapPin style={{ width: '1rem', height: '1rem' }} />
            <span>General Outlet</span>
          </div>
        </div>

        {/* Total Amount */}
        <div className="order-total">
          <span className="total-label">Total Amount</span>
          <div className="total-amount">
            <DollarSign
              className="dollar-icon"
              style={{ width: '1rem', height: '1rem' }}
            />
            <span className="amount">{order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Hover Action Buttons */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: 'auto',
          }}
          className="order-actions"
        >
          <div className="action-buttons">
            <Button
                onClick={(e) => {
                    e.stopPropagation();
                    handleOrderNavigation();
                }}
                variant='primary'
            >
                View Details
            </Button>

            {isPending && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove();
                }}
                disabled={isApproving}
                className="action-button-approve"
              >
                {isApproving ? '...' : '✓'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

OrderCard.displayName = 'OrderCard';

export default OrderCard;