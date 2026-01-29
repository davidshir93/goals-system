import { useState, useEffect, useCallback } from 'react';

export type ViewPreference = 'card' | 'table';

const STORAGE_KEY = 'goals-view-preference';
const DEFAULT_VIEW: ViewPreference = 'card';

export function useViewPreference(): [ViewPreference, (view: ViewPreference) => void] {
  const [view, setViewState] = useState<ViewPreference>(() => {
    if (typeof window === 'undefined') return DEFAULT_VIEW;
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'card' || stored === 'table') ? stored : DEFAULT_VIEW;
  });

  const setView = useCallback((newView: ViewPreference) => {
    setViewState(newView);
    localStorage.setItem(STORAGE_KEY, newView);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newValue = e.newValue as ViewPreference;
        if (newValue === 'card' || newValue === 'table') {
          setViewState(newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return [view, setView];
}
