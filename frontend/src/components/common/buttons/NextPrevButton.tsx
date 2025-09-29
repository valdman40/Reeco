import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

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

  // Additional styles for icon-only mode
  const iconOnlyStyles = iconOnly 
    ? 'p-3 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50' 
    : '';

  const finalClassName = iconOnly ? `${iconOnlyStyles} ${className}` : className;

  return (
    <Button
      variant={'primary'}
      disabled={disabled}
      onClick={onClick}
      className={finalClassName}
      style={{ maxWidth: '120px' }}
    >
      {iconOnly ? (
        isPrev ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
      ) : (
        <div className="flex items-center justify-between">
          {isPrev && <ChevronLeft className="w-4 h-4" />}
          <span>{isPrev ? 'Previous' : 'Next'}</span>
          {isNext && <ChevronRight className="w-4 h-4" />}
        </div>
      )}
    </Button>
  );
}