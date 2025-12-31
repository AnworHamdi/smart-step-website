
import { useEffect, useRef, RefObject } from 'react';

/**
 * A custom hook that uses the IntersectionObserver API to add a CSS class
 * to an element when it scrolls into the viewport, triggering an animation.
 *
 * @param className The CSS class to add when the element is visible. Defaults to 'is-visible'.
 * @returns A RefObject to be attached to the target HTMLElement.
 */
export const useScrollAnimation = <T extends HTMLElement>(className: string = 'is-visible'): RefObject<T> => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    // Ensure IntersectionObserver is available
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers: just make the element visible
      if (elementRef.current) {
        elementRef.current.classList.add(className);
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When the element is in view, add the specified class
          if (entry.isIntersecting) {
            entry.target.classList.add(className);
            // Stop observing the element once it's visible to save resources
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    // Cleanup function to unobserve the element when the component unmounts
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [className]); // Re-run effect if className changes

  return elementRef;
};
