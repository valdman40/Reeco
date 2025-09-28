import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NextPrevButtonProps {
  type: 'next' | 'prev';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export default function NextPrevButton({ 
  type, 
  onClick, 
  disabled = false,
  className = '',
  iconOnly = false
}: NextPrevButtonProps) {
  const isNext = type === 'next';
  const isPrev = type === 'prev';

  // Default styles for different modes
  const baseClassName = iconOnly 
    ? 'p-3 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none'
    : 'button-modern disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none';

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClassName} ${className}`}
    >
      {iconOnly ? (
        // Icon-only mode (for desktop)
        isPrev ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
      ) : (
        // Text + icon mode (for mobile)
        <div className="flex items-center w-[100px] justify-between">
          {isPrev && <ChevronLeft className="w-4 h-4" />}
          <span>{isPrev ? 'Previous' : 'Next'}</span>
          {isNext && <ChevronRight className="w-4 h-4" />}
        </div>
      )}
    </motion.button>
  );
}