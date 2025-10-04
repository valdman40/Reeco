import { useState } from 'react';
import Button from './common/buttons/Button';

/**
 * Test component to demonstrate functional error boundary functionality
 * This component intentionally throws an error when the button is clicked
 * The functional ErrorBoundary will catch it and provide recovery options
 */
export default function ErrorBoundaryTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error to demonstrate the functional ErrorBoundary functionality');
  }

  return (
    <div className="p-4 border rounded-lg bg-red-50 border-red-200 max-w-md">
      <h3 className="font-semibold text-red-800 mb-2">Functional Error Boundary Test</h3>
      <p className="text-red-600 text-sm mb-4">
        Click the button below to simulate a React error. The functional ErrorBoundary will catch it 
        and provide a "Try Again" button that resets the error state.
      </p>
      <Button 
        onClick={() => setShouldThrow(true)}
        variant="secondary"
      >
        Trigger Test Error
      </Button>
    </div>
  );
}