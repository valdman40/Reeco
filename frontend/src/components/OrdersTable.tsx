import { Order } from '../types/order';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, ArrowUpDown, X } from 'lucide-react';
import { Spin } from 'antd';
import { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import Button from './common/buttons/Button';
import { useOrderSelection } from '../hooks/useOrderSelection';
import { useCancelOrder } from '../hooks/useCancelOrder';
import LoadingMessage from './common/LoadingMessage';

export default function OrdersTable({ items, isLoading }: { items: Order[]; isLoading?: boolean }) {
  const [params, set] = useSearchParams();
  const sort = params.get('sort') ?? 'createdAt:desc';
  // Remove client-side sorting - server now handles this
  const sorted = items;
  
  // Delayed loading state to prevent flickering on fast requests
  const [showLoading, setShowLoading] = useState(false);
  
  useEffect(() => {
    let timeoutId: number;
    
    if (isLoading) {
      // Wait 100ms before showing loading indicator
      timeoutId = window.setTimeout(() => {
        setShowLoading(true);
      }, 100);
    } else {
      // Immediately hide loading when done
      setShowLoading(false);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);
  
  // Selection management
  const selection = useOrderSelection();
  const cancelOrder = useCancelOrder();

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

  const handleCancelSelected = () => {
    selection.selectedOrderIds.forEach(id => {
      cancelOrder.mutate({ id });
    });
    selection.clearSelection();
  };

  return (
    <div className="orders-container">
      {/* Selection and Sort Controls */}
      <div className="orders-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            {/* Loading Indicator and Selection Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Loading Indicator */}
              {showLoading && <LoadingMessage message="Loading..." /> }

              {selection.selectedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    {selection.selectedCount} order{selection.selectedCount > 1 ? 's' : ''} selected
                  </span>

                                  
                  <Button
                    onClick={handleCancelSelected}
                    variant="secondary"
                    disabled={cancelOrder.isPending}
                    style={{
                      backgroundColor: '#fee2e2',
                      borderColor: '#fca5a5',
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      padding: '6px 12px',
                    }}
                  >
                    <X style={{ width: '0.875rem', height: '0.875rem' }} />
                    {cancelOrder.isPending ? 'Cancelling...' : 'Cancel Selected'}
                  </Button>

                  <button
                    onClick={selection.clearSelection}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Clear Selection
                  </button>
                </motion.div>
              )}
            </div>

            {/* Sort Controls */}
            <motion.div style={{ display: 'flex', gap: '8px' }}>
              <Button
                onClick={() => toggle('total')}
                variant="secondary"
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
              </Button>
              
              <Button
                onClick={() => toggle('createdAt')}
                variant="secondary"
                className="sort-button"
              >
                <ArrowUpDown style={{ width: '1rem', height: '1rem' }} />
                <span>
                  Sort by Created Date
                  {sort.startsWith('createdAt:') && (
                    <span style={{ marginLeft: '4px', fontSize: '0.8em', opacity: 0.7 }}>
                      ({sort.includes('desc') ? '↓' : '↑'})
                    </span>
                  )}
                </span>
              </Button>
              </motion.div>
          </div>
        </div>

      {/* Orders Grid */}
      <div className="orders-grid">
        <AnimatePresence mode="popLayout">
          {sorted.map((order, index) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              index={index}
              isSelected={selection.isSelected(order.id)}
              onSelectionToggle={selection.toggleSelection}
            />
          ))}
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
