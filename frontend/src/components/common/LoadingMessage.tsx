import { motion } from 'framer-motion';

interface LoadingMessageProps {
  message: string;
}

export default function LoadingMessage({ message }: LoadingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative">
        <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
        <div className="w-20 h-20 border-4 border-purple-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-gray-600 mt-6 text-lg font-medium"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}