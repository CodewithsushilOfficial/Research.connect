import React, { useEffect, useRef } from 'react';

/**
 * Animated count-up hook for numeric values.
 * Respects prefers-reduced-motion.
 */
export function useCountUp(target, duration = 900) {
  const ref = useRef(null);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReduced) {
      ref.current.textContent = target.toLocaleString();
      return;
    }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      if (ref.current) ref.current.textContent = start.toLocaleString();
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, prefersReduced]);

  return ref;
}

/**
 * CountUp component — animates a number from 0 to its value.
 */
const CountUp = ({ value, className = '', suffix = '' }) => {
  const ref = useCountUp(value);
  return <span ref={ref} className={className}>{value.toLocaleString()}{suffix}</span>;
};

export default CountUp;
