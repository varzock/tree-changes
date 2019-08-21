import * as equal from 'fast-deep-equal';
import { compareNumbers, getIterables, isArray, isDefined, isPlainObj, nested } from './helpers';

import { Data, Key, Value, TreeChanges } from './types';

export default function treeChanges(data: Data, nextData: Data): TreeChanges {
  if (!data || !nextData) {
    throw new Error('Missing required parameters');
  }

  const added = (key?: Key): boolean => {
    try {
      if (key && !(key in data) && key in nextData) {
        return true;
      }

      const [left, right] = getIterables(data, nextData, { key, exclude: 'string' });

      return left.length < right.length;
    } catch (error) {
      return false;
    }
  };

  const changed = (key?: Key, actual?: Value, previous?: Value): boolean => {
    const left = nested(data, key);
    const right = nested(nextData, key);
    const hasActual = isDefined(actual);
    const hasPrevious = isDefined(previous);

    if (hasActual && !hasPrevious) {
      const leftComparator = isArray(actual) ? actual.indexOf(left) < 0 : left !== actual;
      const rightComparator = isArray(actual) ? actual.indexOf(right) >= 0 : right === actual;

      return leftComparator && rightComparator;
    }

    if (hasPrevious) {
      const leftComparator = isArray(previous) ? previous.indexOf(left) >= 0 : left === previous;
      const rightComparator = isArray(actual) ? actual.indexOf(right) >= 0 : right === actual;

      return leftComparator && rightComparator;
    }

    if ([left, right].every(isArray) || [left, right].every(isPlainObj)) {
      return !equal(left, right);
    }

    return left !== right;
  };

  const changedFrom = (key: Key, previous: Value, actual?: Value): boolean => {
    if (!isDefined(key)) {
      return false;
    }

    const left = nested(data, key);
    const right = nested(nextData, key);
    const hasActual = isDefined(actual);
    const leftComparator = isArray(previous) ? previous.indexOf(left) >= 0 : left === previous;
    const rightComparator = isArray(actual) ? actual.indexOf(right) >= 0 : right === actual;

    return leftComparator && (hasActual ? rightComparator : !hasActual);
  };

  /**
   * @deprecated
   */
  const changedTo = (key: Key, actual: Value): boolean => {
    if (!isDefined(key)) {
      return false;
    }

    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('`changedTo` is deprecated! Replace it with `change`');
    }

    return changed(key, actual);
  };

  const decreased = (key: Key, actual?: Value, previous?: Value): boolean => {
    if (!isDefined(key)) {
      return false;
    }

    return compareNumbers(data, nextData, 'decreased', { key, actual, previous });
  };

  const emptied = (key?: Key): boolean => {
    try {
      const [left, right] = getIterables(data, nextData, { key });
      return !!left.length && !right.length;
    } catch (error) {
      return false;
    }
  };

  const filled = (key?: Key): boolean => {
    try {
      const [left, right] = getIterables(data, nextData, { key });
      return !left.length && !!right.length;
    } catch (error) {
      return false;
    }
  };

  const increased = (key: Key, actual?: Value, previous?: Value): boolean => {
    if (!isDefined(key)) {
      return false;
    }

    return compareNumbers(data, nextData, 'increased', { key, actual, previous });
  };

  const removed = (key?: Key): boolean => {
    try {
      if (key && key in data && !(key in nextData)) {
        return true;
      }

      const [left, right] = getIterables(data, nextData, { key, exclude: 'string' });
      return left.length > right.length;
    } catch (error) {
      return false;
    }
  };

  return { added, changed, changedFrom, changedTo, decreased, emptied, filled, increased, removed };
}
