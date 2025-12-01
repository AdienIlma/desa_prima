import { useEffect, useRef, useState } from 'react';

const useHighlightScroll = (highlightId, data) => {
  const highlightedRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  const isHighlighted = (item) => {
    if (!item || !highlightId) return false;
    return item.id?.toString() === highlightId.toString();
  };

  useEffect(() => {
    if (highlightId) {
      setIsInitialLoad(true);
      setHasScrolled(false);
    }
  }, [highlightId]);

  useEffect(() => {
    if (!highlightId || !isInitialLoad || hasScrolled || !data?.length) return;

    const scrollToElement = () => {
      try {
        if (highlightedRef.current) {
          highlightedRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          setHasScrolled(true);
        }
      } catch (error) {
        console.error('Scroll error:', error);
      }
    };

    scrollToElement();

    // Fallback dengan Intersection Observer untuk memastikan element ada di DOM
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          scrollToElement();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (highlightedRef.current) {
      observer.observe(highlightedRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [highlightId, data, isInitialLoad, hasScrolled]);

  return {
    highlightedRef,
    isHighlighted,
    highlightedClassName: isHighlighted ? 'ring-2 ring-blue-500 bg-blue-50' : ''
  };
};

export default useHighlightScroll;