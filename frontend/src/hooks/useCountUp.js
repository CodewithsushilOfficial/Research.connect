import { useState, useEffect } from 'react';

export const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!end && end !== 0) return;
    const target = parseInt(end, 10);
    if (isNaN(target)) return;

    let start = 0;
    const increment = Math.ceil(target / (duration / 16)); // assuming 60fps (~16ms per frame)
    const stepTime = Math.max(16, Math.floor(duration / target)); 
    let timer;

    if (target === 0) {
      setCount(0);
      return;
    }

    const run = () => {
      start += increment;
      if (start >= target) {
        setCount(target);
      } else {
        setCount(start);
        timer = requestAnimationFrame(run);
      }
    };

    timer = requestAnimationFrame(run);

    return () => cancelAnimationFrame(timer);
  }, [end, duration]);

  return count;
};
