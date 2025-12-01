import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useHighlightRow = () => {
  const location = useLocation();
  const [highlightedId, setHighlightedId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');
    
    if (highlightId && highlightId !== 'undefined') {
      setHighlightedId(highlightId);
      
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  return highlightedId;
};