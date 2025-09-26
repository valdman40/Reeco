import {useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Search, X} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';

export default function SearchInput(){
  const [params,set]=useSearchParams();
  const [val,setVal]=useState(params.get('q')??'');
  const [focused, setFocused] = useState(false);
  
  function onChange(e: React.ChangeEvent<HTMLInputElement>){
    setVal(e.target.value);
    params.set('q',e.target.value);
    params.set('page','1');
    set(params);
  }

  function clearSearch(){
    setVal('');
    params.delete('q');
    params.set('page','1');
    set(params);
  }
  
  return (
    <div className="relative">
      <motion.div
        whileFocus={{ scale: 1.02 }}
        className="relative"
      >
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors duration-200 ${
            focused ? 'text-purple-500' : 'text-gray-400'
          }`} />
        </div>
        
        {/* Input Field */}
        <input 
          type="text"
          value={val} 
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search orders, customers, or order IDs..."
          style={{
            borderRadius: '16px',
            padding: '12px 48px 12px 48px'
          }}
          className={`input-modern block w-full text-sm font-medium placeholder-gray-400 transition-all duration-200 ${
            focused 
              ? 'ring-2 ring-purple-500 ring-opacity-50 border-purple-500 shadow-glow' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        
        {/* Clear Button */}
        <AnimatePresence>
          {val && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
