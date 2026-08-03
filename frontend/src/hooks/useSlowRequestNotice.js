import { useState, useEffect } from 'react';

const DEFAULT_THRESHOLD_MS = 4000;

/**
 * Returns true once `isLoading` has been true continuously for longer
 * than `thresholdMs`. Useful for showing a "server is waking up, please
 * wait" message on free-tier hosts where the backend can cold-start.
 */
const useSlowRequestNotice = (isLoading, thresholdMs = DEFAULT_THRESHOLD_MS) => {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return undefined;
    }
    const timer = setTimeout(() => setIsSlow(true), thresholdMs);
    return () => clearTimeout(timer);
  }, [isLoading, thresholdMs]);

  return isSlow;
};

export default useSlowRequestNotice;
