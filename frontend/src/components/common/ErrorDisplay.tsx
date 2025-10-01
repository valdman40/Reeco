import { motion } from 'framer-motion';
import ErrorIcon from '../icons/ErrorIcon';

interface ErrorDisplayProps {
  title: string;
  message: string;
}

export default function ErrorDisplay({ title, message }: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-r from-red-50 via-red-50 to-pink-50 p-8"
    >
      <div className="flex items-center justify-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <ErrorIcon className="h-6 w-6 text-red-500" />
          </div>
        </div>
        <div className="ml-6 text-center">
          <h3 className="text-xl font-bold text-red-800 mb-2">
            {title}
          </h3>
          <p className="text-red-600">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}