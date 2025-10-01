import { motion } from 'framer-motion';
import { Spin } from 'antd';

interface LoadingMessageProps {
  message: string;
}

export default function LoadingMessage({ message }: LoadingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center"
      style={{ gap: '1rem' }}
    >
      <Spin size="small" />
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