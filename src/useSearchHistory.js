import { useState, useCallback } from 'react';

const KEY = 'tedport_search_history';
const MAX = 8;

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function useSearchHistory() {
  const [history, setHistory] = useState(read);

  const addToHistory = useCallback((term) => {
    const trimmed = (term || '').trim();
    if (trimmed.length < 2) return;
    setHistory(prev => {
      const filtered = prev.filter(h => h !== trimmed);
      const next = [trimmed, ...filtered].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((term) => {
    setHistory(prev => {
      const next = prev.filter(h => h !== term);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(KEY); } catch {}
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
