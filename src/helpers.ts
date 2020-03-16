import * as equal from 'fast-deep-equal';
import { Data, Key, Params, PlainObject, Value } from './types';

export function canHaveLength(...args: any): boolean {
  return args.every((d: any) => {
    return isString(d) || isArray(d) || isPlainObject(d);
  });
}

export function checkEntries(input: any) {
  return ([k, v]: [string, any]) => {
    if (equal(input, v)) {
      return true;
    }

    if (isArray(input)) {
      return input.some(d => equal(d, v) || (isArray(v) && v.indexOf(d) >= 0));
    }

    if (isPlainObject(input)) {
      return !!input[k] && equal(input[k], v);
    }

    return equal(input, v);
  };
}

export function checkItems(input: any) {
  return (value: any) => {
    if (isArray(input)) {
      return input.some(d => equal(d, value) || (isArray(value) && value.indexOf(d) >= 0));
    }

    return equal(input, value);
  };
}

export function compareNumbers(
  previousData: Data,
  data: Data,
  type: string,
  { actual, key, previous }: Params,
): boolean {
  const left = nested(previousData, key);
  const right = nested(data, key);
  const hasActual = typeof actual !== 'undefined';
  const hasPrevious = typeof previous !== 'undefined';

  let changed =
    [left, right].every(isNumber) && (type === 'increased' ? left < right : left > right);

  if (hasActual) {
    changed = changed && right === actual;
  }

  if (hasPrevious) {
    changed = changed && left === previous;
  }

  return changed;
}

export function compareValues(left: Data, right: Data, value: Value) {
  if (!isSameType(left, right)) {
    return false;
  }

  if (!isDefined(left) && right) {
    return true;
  }

  if (isArray(left) && isArray(right)) {
    return !left.some(checkItems(value)) && right.some(checkItems(value));
  }

  /* istanbul ignore else */
  if (isPlainObject(left) && isPlainObject(right)) {
    return (
      !Object.entries(left).some(checkEntries(value)) &&
      Object.entries(right).some(checkEntries(value))
    );
  }

  return right === value;
}

export function getIterables(
  previousData: Data,
  data: Data,
  { filter = true, includeStrings, key }: Partial<Params> = {},
) {
  let [left, right] = getDataValues(previousData, data, { filter, key });

  if (!isSameType(left, right)) {
    throw new TypeError('Inputs have different types');
  }

  if (!canHaveLength(left, right)) {
    throw new TypeError("Inputs dont't have length");
  }

  if (!includeStrings && [left, right].every(isString)) {
    throw new TypeError('Strings are excluded');
  }

  if ([left, right].every(isPlainObject)) {
    left = Object.keys(left);
    right = Object.keys(right);
  }

  return [left, right];
}

export function getDataValues(prevData: any, data: any, options?: Partial<Params>) {
  const { filter, key } = options || {};

  if (key) {
    const leftWithKey = nested(prevData, key);
    const rightWithKey = nested(data, key);

    if (
      !filter ||
      (isPlainObject(leftWithKey) && isPlainObject(rightWithKey)) ||
      (isArray(leftWithKey) && isArray(rightWithKey))
    ) {
      return [leftWithKey, rightWithKey];
    }
  }

  return [prevData, data];
}

export function getKeys(key: Key) {
  let keys: Array<string | number> = [];

  if (isString(key)) {
    keys = key.split('.');
  } else {
    keys.push(key);
  }

  return {
    parentKey: keys.slice(-2, 1)[0],
    childKey: keys.slice(-1)[0],
  };
}

export function isArray(value: unknown): value is Array<typeof value> {
  return Array.isArray(value);
}

export function isCompatible(prevData: any, data: any, options?: Partial<Params>): boolean {
  const { filter = true, includeStrings, key } = options || {};
  let upperKey;

  if (key) {
    const { childKey, parentKey } = getKeys(key);
    upperKey = parentKey || childKey;
  }

  const [left, right] = getDataValues(prevData, data, { filter, key: upperKey });

  if (!isSameType(left, right)) {
    return false;
  }

  const checks = [isPlainObject(left) && isPlainObject(right), isArray(left) && isArray(right)];

  if (includeStrings) {
    checks.push(isString(left) && isString(right));
  }

  return checks.some(d => d === true);
}

export function isDefined(value: unknown): boolean {
  return typeof value !== 'undefined';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isPlainObject(value: unknown): value is PlainObject {
  if (!value) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);

  return (
    Object.prototype.toString.call(value).slice(8, -1) === 'Object' &&
    (prototype === null || prototype === Object.getPrototypeOf({}))
  );
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isSameType(...args: any): boolean {
  return (
    args.every(isArray) || args.every(isNumber) || args.every(isPlainObject) || args.every(isString)
  );
}

export function nested(input: PlainObject | any[], property?: Key) {
  /* istanbul ignore else */
  if (isPlainObject(input) || isArray(input)) {
    /* istanbul ignore else */
    if (isString(property) && property !== '') {
      const split = property.split('.');
      // @ts-ignore
      return split.reduce((obj, prop) => obj && obj[prop], input);
    }

    if (isNumber(property) && isArray(input)) {
      return input[property];
    }

    return input;
  }

  return input;
}
