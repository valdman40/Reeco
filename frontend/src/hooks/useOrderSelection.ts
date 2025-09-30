import { useState, useCallback } from 'react';

export interface OrderSelectionHook {
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
  isSelected: (id: string) => boolean;
  selectedCount: number;
  selectedOrderIds: string[];
}

export function useOrderSelection(): OrderSelectionHook {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  return {
    selectedIds,
    toggleSelection,
    clearSelection,
    selectAll,
    isSelected,
    selectedCount: selectedIds.size,
    selectedOrderIds: Array.from(selectedIds),
  };
}
