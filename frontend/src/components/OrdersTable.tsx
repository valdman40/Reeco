import { Order } from '../types/order';
import { useApproveOrder } from '../hooks/useApproveOrder';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sortOrders } from '../utils/clientSort';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  Hash,
  MapPin,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersTable({ items }: { items: Order[] }) {
  const approve = useApproveOrder();
  const [params, set] = useSearchParams();
  const nav = useNavigate();
  const sort = params.get('sort') ?? 'createdAt:desc';
  const sorted = sortOrders(items, sort);

  function toggle(f: string) {
    const dir = sort.indexOf('desc') > -1 ? 'asc' : 'desc';
    params.set('sort', `${f}:${dir}`);
    set(params);
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          badgeClass: 'status-badge pending',
          icon: <Clock style={{ width: '1rem', height: '1rem' }} />,
          indicatorClass: 'pending',
        };
      case 'approved':
        return {
          badgeClass: 'status-badge approved',
          icon: <CheckCircle style={{ width: '1rem', height: '1rem' }} />,
          indicatorClass: 'approved',
        };
      case 'rejected':
        return {
          badgeClass: 'status-badge rejected',
          icon: <XCircle style={{ width: '1rem', height: '1rem' }} />,
          indicatorClass: 'rejected',
        };
      default:
        return {
          badgeClass: 'status-badge',
          icon: <Clock style={{ width: '1rem', height: '1rem' }} />,
          indicatorClass: 'default',
        };
    }
  };

  return (
    <div className="orders-container">
      {/* Sort Controls */}
      <div className="orders-header">
        <h3 className="orders-title">Recent Orders ({sorted.length})</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggle('total')}
          className="sort-button"
        >
          <ArrowUpDown style={{ width: '1rem', height: '1rem' }} />
          <span>Sort by Total</span>
        </motion.button>
      </div>

      {/* Orders Grid */}
      <div className="orders-grid">
        <AnimatePresence mode="popLayout">
          {sorted.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => nav(`/orders?id=${order.id}`)}
                className="order-card"
              >
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
                      nav(`/orders?id=${order.id}`);
                    }}
                  >
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                  </motion.button>
                </div>

                {/* Status Badge */}
                <div>
                  <span className={statusConfig.badgeClass}>
                    {statusConfig.icon}
                    <span style={{ textTransform: 'capitalize' }}>
                      {order.status}
                    </span>
                  </span>
                </div>

                {/* Order Details */}
                <div className="order-details">
                  <div className="order-detail-item">
                    <Calendar style={{ width: '1rem', height: '1rem' }} />
                    <span>
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </span>
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
                    <span className="amount">
                      {order.total.toLocaleString()}
                    </span>
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
                        nav(`/orders?id=${order.id}`);
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sorted.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state"
        >
          <div className="empty-state-icon">
            <Hash />
          </div>
          <h3>No orders found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </motion.div>
      )}
    </div>
  );
}
