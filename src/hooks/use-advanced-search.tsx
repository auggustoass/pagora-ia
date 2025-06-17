
import { useState, useMemo, useCallback } from 'react';
import { useAdvancedDebounce } from './use-advanced-debounce';

interface SearchOptions {
  searchFields: string[];
  filterFields?: string[];
  sortOptions?: { field: string; direction: 'asc' | 'desc' }[];
}

export function useAdvancedSearch<T extends Record<string, any>>(
  data: T[],
  options: SearchOptions
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const debouncedSearchTerm = useAdvancedDebounce(searchTerm, {
    delay: 300,
    maxWait: 1000
  });

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply text search
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(item =>
        options.searchFields.some(field =>
          String(item[field]).toLowerCase().includes(term)
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        result = result.filter(item => {
          if (Array.isArray(value)) {
            return value.includes(item[field]);
          }
          return item[field] === value;
        });
      }
    });

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy.field];
        const bVal = b[sortBy.field];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return sortBy.direction === 'asc' ? comparison : -comparison;
        }
        
        if (aVal < bVal) return sortBy.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortBy.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, debouncedSearchTerm, filters, sortBy, options.searchFields]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (term && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev.slice(0, 9)]);
    }
  }, [searchHistory]);

  const updateFilter = useCallback((field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setSortBy(null);
  }, []);

  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const term = searchTerm.toLowerCase();
    const suggestions = new Set<string>();
    
    data.forEach(item => {
      options.searchFields.forEach(field => {
        const value = String(item[field]).toLowerCase();
        if (value.includes(term) && value !== term) {
          suggestions.add(String(item[field]));
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [data, searchTerm, options.searchFields]);

  return {
    searchTerm,
    filters,
    sortBy,
    searchHistory,
    suggestions,
    filteredData: filteredAndSortedData,
    updateSearchTerm,
    updateFilter,
    setSortBy,
    clearFilters,
    resultCount: filteredAndSortedData.length
  };
}
