import { Order } from '../types/order';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, ArrowUpDown } from 'lucide-react';
import OrderCard from './OrderCard';

export default function OrdersTable({ items }: { items: Order[] }) {
  const [params, set] = useSearchParams();
  const sort = params.get('sort') ?? 'createdAt:desc';
  // Remove client-side sorting - server now handles this
  const sorted = items;

  function toggle(f: string) {
    const [currentField, currentDir] = sort.split(':');
    
    // If clicking the same field, toggle direction
    // If clicking a different field, start with desc (most common for totals/dates)
    const dir = currentField === f 
      ? (currentDir === 'desc' ? 'asc' : 'desc')
      : 'desc';
      
    params.set('sort', `${f}:${dir}`);
    set(params);
  }

  return (
    <div className="orders-container">
      {/* Sort Controls */}
      <div className="orders-header">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggle('total')}
          className="sort-button"
        >
          <ArrowUpDown style={{ width: '1rem', height: '1rem' }} />
          <span>
            Sort by Total
            {sort.startsWith('total:') && (
              <span style={{ marginLeft: '4px', fontSize: '0.8em', opacity: 0.7 }}>
                ({sort.includes('desc') ? '↓' : '↑'})
              </span>
            )}
          </span>
        </motion.button>
      </div>

      {/* Orders Grid */}
      <div className="orders-grid">
        <AnimatePresence mode="popLayout">
          {sorted.map((order, index) => <OrderCard key={order.id} order={order} index={index} />)}
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
