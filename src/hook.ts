import { useEffect, useRef } from 'react';
import { diff } from 'deep-diff';
import { TreeChangesFn } from './types';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default function createTreeChangesHook(treeChanges: TreeChangesFn) {
  return function useTreeChanges(value: any) {
    const previousValue = usePrevious(value);
    const ref = useRef(treeChanges(previousValue || value, value));

    useEffect(() => {
      if (previousValue && diff(previousValue, value)) {
        ref.current = treeChanges(previousValue, value);
      }
    }, [previousValue, value]);

    return ref.current;
  };
}
