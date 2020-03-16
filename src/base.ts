import * as equal from 'fast-deep-equal';
import {
  compareNumbers,
  compareValues,
  getIterables,
  getDataValues,
  isArray,
  isCompatible,
  isDefined,
  isPlainObject,
  nested,
} from './helpers';

import { Data, Key, Value, TreeChanges } from './types';

export default function treeChanges(previousData: Data, data: Data): TreeChanges {
  if (!previousData || !data) {
    throw new Error('Missing required parameters');
  }

  const added = (key?: Key, value?: Value): boolean => {
    try {
      // skip if immediate parent isn't an array or object
      if (!isCompatible(previousData, data, { key })) {
        return false;
      }

      const [left, right] = getDataValues(previousData, data, { filter: true, key });

      if (value) {
        // skip if key exists in the narrowed data
        if (key && left[key] && right[key]) {
          return false;
        }

        return compareValues(left, right, value);
      }

      if (key && !(key in left) && key in right) {
        return true;
      }

      const [leftIterable, rightIterable] = getIterables(previousData, data, {
        key,
      });

      return leftIterable.length < rightIterable.length;
    } catch (error) {
      return false;
    }
  };

  const changed = (key?: Key, actual?: Value, previous?: Value): boolean => {
    const left = nested(previousData, key);
    const right = nested(data, key);
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

    if ([left, right].every(isArray) || [left, right].every(isPlainObject)) {
      return !equal(left, right);
    }

    return left !== right;
  };

  const changedFrom = (key: Key, previous: Value, actual?: Value): boolean => {
    if (!isDefined(key)) {
      return false;
    }

    const left = nested(previousData, key);
    const right = nested(data, key);
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

    return compareNumbers(previousData, data, 'decreased', { key, actual, previous });
  };

  const emptied = (key?: Key): boolean => {
    try {
      const [left, right] = getIterables(previousData, data, { includeStrings: true, key });
      return !!left.length && !right.length;
    } catch (error) {
      return false;
    }
  };

  const filled = (key?: Key): boolean => {
    try {
      const [left, right] = getIterables(previousData, data, {
        filter: false,
        includeStrings: true,
        key,
      });

      return !left.length && !!right.length;
    } catch (error) {
      return false;
    }
  };

  const increased = (key: Key, actual?: Value, previous?: Value): boolean => {
    if (!isDefined(key)) {
      return false;
    }

    return compareNumbers(previousData, data, 'increased', { key, actual, previous });
  };

  const removed = (key?: Key, value?: Value): boolean => {
    try {
      // skip if immediate parent isn't an array or object
      if (!isCompatible(previousData, data, { key })) {
        return false;
      }

      const [left, right] = getDataValues(previousData, data, { filter: true, key });

      if (value) {
        // skip if key exists in the narrowed data
        if (key && left[key] && right[key]) {
          return false;
        }

        return compareValues(right, left, value);
      }

      if (key && key in left && !(key in right)) {
        return true;
      }

      const [leftIterable, rightIterable] = getIterables(data, previousData, {
        key,
      });

      return leftIterable.length < rightIterable.length;
    } catch (error) {
      return false;
    }
  };

  return { added, changed, changedFrom, changedTo, decreased, emptied, filled, increased, removed };
}
