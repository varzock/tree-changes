/* eslint-disable @typescript-eslint/no-use-before-define */
import { Data, Params, GenericObject, Comparator } from './types';

export function canHaveLength(...args: any): boolean {
  return args.every((d: any) => {
    return isString(d) || isArray(d) || isPlainObj(d);
  });
}

export function compareNumbers(
  data: Data,
  nextData: Data,
  type: string,
  { actual, key, previous }: Params,
): boolean {
  const left = nested(data, key);
  const right = nested(nextData, key);
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

export function getIterables(
  data: Data,
  nextData: Data,
  { exclude, key }: Partial<Params>,
): Comparator {
  let left = nested(data, key);
  let right = nested(nextData, key);

  if (!isSameType(left, right)) {
    throw new TypeError('Inputs have different types');
  }

  if (!canHaveLength(left, right)) {
    throw new TypeError("Inputs dont't have length");
  }

  if (exclude === 'string' && [left, right].every(isString)) {
    throw new TypeError('Strings are excluded');
  }

  if ([left, right].every(isPlainObj)) {
    left = Object.keys(left);
    right = Object.keys(right);
  }

  return [left, right];
}

export function isArray(value: unknown): value is Array<typeof value> {
  return Array.isArray(value);
}

export function isDefined(value: unknown): boolean {
  return typeof value !== 'undefined';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isPlainObj(value: unknown): value is GenericObject {
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
    args.every(isArray) || args.every(isNumber) || args.every(isPlainObj) || args.every(isString)
  );
}

export function nested(input: GenericObject, property: string | number | undefined) {
  if (isPlainObj(input) || isArray(input)) {
    if (isString(property) && property !== '') {
      const split = property.split('.');
      return split.reduce((obj, prop) => obj && obj[prop], input);
    }

    if (isNumber(property)) {
      return input[property];
    }

    return input;
  }

  return input;
}
