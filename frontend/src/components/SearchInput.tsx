import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchInput } from '../hooks/useSearchInput';

export default function SearchInput() {
  // UI state only
  const [focused, setFocused] = useState(false);
  
  // All data logic in custom hook
  const { searchValue, handleSearchChange, clearSearch } = useSearchInput();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
  };

  return (
    <div className="relative">
      <motion.div whileFocus={{ scale: 1.02 }} className="flex items-center">
        {/* Search Icon */}
        <div className="pl-4 flex items-center pointer-events-none">
          <Search
            className={`w-5 h-5 transition-colors duration-200 ${
              focused ? 'text-purple-500' : 'text-gray-400'
            }`}
          />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search orders, customers, or order IDs..."
          style={{
            borderRadius: '16px',
            padding: '12px 16px',
          }}
          className={`input-modern flex-1 text-sm font-medium placeholder-gray-400 transition-all duration-200 ${
            focused
              ? 'ring-2 ring-purple-500 ring-opacity-50 border-purple-500 shadow-glow'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />

        {/* Clear Button */}
        <AnimatePresence>
          {searchValue && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={clearSearch}
              className="pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Label */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-2 left-3 px-2 bg-white text-xs font-medium text-purple-600"
          >
            Search Orders
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
