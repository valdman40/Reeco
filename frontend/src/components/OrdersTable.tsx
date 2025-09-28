import { Order } from '../types/order';
import { useSearchParams } from 'react-router-dom';
import { sortOrders } from '../utils/clientSort';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, ArrowUpDown } from 'lucide-react';
import OrderCard from './OrderCard';
import { useEffect } from 'react';

export default function OrdersTable({ items }: { items: Order[] }) {
  const [params, set] = useSearchParams();
  const sort = params.get('sort') ?? 'createdAt:desc';
  const sorted = sortOrders(items, sort);

  useEffect(()=>{
    console.log('OrdersTable first render')
  },[])

  function toggle(f: string) {
    const dir = sort.indexOf('desc') > -1 ? 'asc' : 'desc';
    params.set('sort', `${f}:${dir}`);
    set(params);
  }

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
