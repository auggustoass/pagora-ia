
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const frozen = useRef(false);

  const updateEntry = ([entry]: IntersectionObserverEntry[]) => {
    const isIntersecting = entry.isIntersecting;
    
    if (freezeOnceVisible && isIntersecting) {
      frozen.current = true;
    }
    
    if (!frozen.current) {
      setEntry(entry);
      setIsVisible(isIntersecting);
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, root, rootMargin]);

  return {
    ref: elementRef,
    entry,
    isVisible
  };
}
