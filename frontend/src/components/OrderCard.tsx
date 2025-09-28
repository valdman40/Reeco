import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  User,
  Calendar,
  MapPin,
  DollarSign,
  Eye,
} from 'lucide-react';
import { Order } from '../types/order';
import { useApproveOrder } from '../hooks/useApproveOrder';
import StatusBadge from './common/StatusBadge';
import { getStatusConfig } from '../utils/statusConfig';

interface OrderCardProps {
  order: Order;
  index: number;
}

const OrderCard = React.forwardRef<HTMLDivElement, OrderCardProps>(({ order, index }, ref) => {
  const navigate = useNavigate();
  const approve = useApproveOrder();



  const statusConfig = getStatusConfig(order.status);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.1,
        delay: index * 0.05,
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => navigate(`/orders?id=${order.id}`)}
      className="order-card"
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

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="view-button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/orders?id=${order.id}`);
            }}
          >
            <Eye style={{ width: '1rem', height: '1rem' }} />
          </motion.button>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/orders?id=${order.id}`);
              }}
              className="action-button-primary"
            >
              View Details
            </motion.button>

            {order.status === 'pending' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  approve.mutate({ id: order.id, isApproved: true });
                }}
                disabled={approve.isPending}
                className="action-button-approve"
              >
                {approve.isPending ? '...' : '✓'}
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