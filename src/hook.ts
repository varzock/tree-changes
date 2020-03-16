import { useEffect, useMemo, useRef } from 'react';

import treeChanges from './base';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default function useTreeChanges(value: any) {
  const previousValue = usePrevious(value);

  return useMemo(() => treeChanges(previousValue || value, value), [previousValue, value]);
}
