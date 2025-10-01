import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';

export function useSearchInput() {
  const [params, set] = useSearchParams();
  const [searchValue, setSearchValue] = useState(params.get('q') ?? '');

  // Use custom debounce hook
  const debouncedValue = useDebounce(searchValue, 300);

  // Update URL when debounced value changes
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    const currentQuery = newParams.get('q') ?? '';

    // If debounced value matches current URL, no need to update
    if (debouncedValue === currentQuery) return;

    if (debouncedValue.trim()) {
      newParams.set('q', debouncedValue.trim());
    } else {
      newParams.delete('q');
    }
    newParams.set('page', '1');

    set(newParams);
  }, [debouncedValue, set]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const clearSearch = () => {
    setSearchValue('');
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete('q');
    newParams.set('page', '1');
    set(newParams);
  };

  return {
    searchValue,
    handleSearchChange,
    clearSearch,
  };
}
