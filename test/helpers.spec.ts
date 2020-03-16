// @ts-ignore
import {
  canHaveLength,
  compareNumbers,
  compareValues,
  getIterables,
  isArray,
  isDefined,
  isNumber,
  isPlainObject,
  isSameType,
  isString,
  nested,
} from '../src/helpers';

import { PlainObject } from '../src/types';

const left: PlainObject = {
  data: [],
  messages: [
    { id: 1, messsage: 'hello' },
    { id: 2, messsage: 'hey' },
    { id: 3, messsage: 'sup?' },
  ],
  name: '',
  options: {},
  ratio: 0.8,
  retries: 0,
  status: 'idle',
  version: 1,
};

const right: PlainObject = {
  data: [{ a: 1 }],
  messages: [
    { id: 2, messsage: 'hey' },
    { id: 3, messsage: 'sup?' },
  ],
  name: 'John',
  options: {
    ui: {
      color: '#333',
      tags: ['simple', 'clean'],
    },
    updatedAt: 1234567890,
  },
  ratio: 0.4,
  retries: 1,
  status: 'done',
  version: '1.1',
};

describe('canHaveLength', () => {
  it('should check properly', () => {
    expect(canHaveLength('0', '')).toBe(true);
    expect(canHaveLength([0], [])).toBe(true);
    expect(canHaveLength({}, { a: 1 })).toBe(true);

    expect(canHaveLength(1, 0)).toBe(false);
    expect(canHaveLength(1, {})).toBe(false);
  });
});

describe('compareNumbers', () => {
  describe('increased', () => {
    it('without options', () => {
      expect(compareNumbers(left, right, 'increased', { key: 'retries' })).toBe(true);

      expect(compareNumbers(left, right, 'increased', { key: 'data' })).toBe(false);
      expect(compareNumbers(left, right, 'increased', { key: 'options' })).toBe(false);
      expect(compareNumbers(left, right, 'increased', { key: 'ratio' })).toBe(false);
      expect(compareNumbers(left, right, 'increased', { key: 'stats' })).toBe(false);
    });

    it('with actual', () => {
      expect(compareNumbers(left, right, 'increased', { key: 'retries', actual: 1 })).toBe(true);
      expect(compareNumbers(left, right, 'increased', { key: 'retries', actual: 0.9 })).toBe(false);
      expect(compareNumbers(left, right, 'increased', { key: 'retries', actual: 10 })).toBe(false);
    });

    it('with actual and previous', () => {
      expect(
        compareNumbers(left, right, 'increased', { key: 'retries', actual: 1, previous: 0 }),
      ).toBe(true);
      expect(
        compareNumbers(left, right, 'increased', { key: 'retries', actual: 1, previous: 0.1 }),
      ).toBe(false);
      expect(
        compareNumbers(left, right, 'increased', { key: 'retries', actual: 1, previous: 10 }),
      ).toBe(false);
    });
  });

  describe('decreased', () => {
    it('without options', () => {
      expect(compareNumbers(left, right, 'decreased', { key: 'ratio' })).toBe(true);

      expect(compareNumbers(left, right, 'decreased', { key: 'data' })).toBe(false);
      expect(compareNumbers(left, right, 'decreased', { key: 'options' })).toBe(false);
      expect(compareNumbers(left, right, 'decreased', { key: 'retries' })).toBe(false);
      expect(compareNumbers(left, right, 'decreased', { key: 'stats' })).toBe(false);
    });

    it('with actual', () => {
      expect(compareNumbers(left, right, 'decreased', { key: 'ratio', actual: 0.4 })).toBe(true);
      expect(compareNumbers(left, right, 'decreased', { key: 'ratio', actual: 0.9 })).toBe(false);
      expect(compareNumbers(left, right, 'decreased', { key: 'ratio', actual: 10 })).toBe(false);
    });

    it('with actual and previous', () => {
      expect(
        compareNumbers(left, right, 'decreased', { key: 'ratio', actual: 0.4, previous: 0.8 }),
      ).toBe(true);
      expect(
        compareNumbers(left, right, 'decreased', { key: 'ratio', actual: 0.4, previous: 0.1 }),
      ).toBe(false);
      expect(
        compareNumbers(left, right, 'decreased', { key: 'ratio', actual: 0.4, previous: 10 }),
      ).toBe(false);
    });
  });
});

describe('compareValues', () => {
  describe('left to right', () => {
    it.each([
      // Numbers
      [0.4, 'ratio', true],
      [1, 'retries', true],
      ['1', 'retries', false],

      // Objects
      // [{ color: '#333' }, 'options.ui', true],
      [{ updatedAt: 1234567890 }, 'options', true],
      [{ id: 3, messsage: 'sup?' }, 'messages', false],

      // Arrays
      [[{ a: 1 }], 'data', true],
      [[{ a: 1 }], 'data', true],
      // [{ a: 1 }, 'data', false],

      // String
      ['idle', 'status', false],
      ['done', 'status', true],
      ['', 'name', false],
      ['John', 'name', true],
    ])('compareValues %p should be %s)', (value, key, expected) => {
      expect(compareValues(left[key], right[key], value)).toBe(expected);
    });
  });

  describe('right to left', () => {
    it.each([
      [0.8, 'ratio', true],
      [{ id: 1, messsage: 'hello' }, 'messages', true],
      [{ id: 2, messsage: 'hey' }, 'messages', false],
      [{ id: 3, messsage: 'sup?' }, 'messages', false],
    ])('compareValues with %s should be %s)', (value, key, expected) => {
      expect(compareValues(right[key], left[key], value)).toBe(expected);
    });
  });
});

describe('getComparables', () => {
  it('should get iterables', () => {
    expect(getIterables(left, right, { key: 'data' })).toEqual([[], [{ a: 1 }]]);
    expect(getIterables(left, right, { key: 'options' })).toEqual([[], ['ui', 'updatedAt']]);
    expect(getIterables(left, right, { key: 'status' })).toMatchSnapshot();
  });

  it('should throw for invalid types', () => {
    expect(() => getIterables(left.version, right.version, { key: 'version' })).toThrow(
      'Inputs have different types',
    );

    expect(() => getIterables(left.ratio, right.ratio)).toThrow("Inputs dont't have length");

    expect(() => getIterables(left.status, right.status)).toThrow('Strings are excluded');
  });
});

describe('isArray', () => {
  it('should detect arrays', () => {
    expect([[], []].every(isArray)).toBe(true);

    expect([[], {}].every(isArray)).toBe(false);
    expect([0, []].every(isArray)).toBe(false);
    expect(['', 1].every(isArray)).toBe(false);
  });
});

describe('isDefined', () => {
  it('should return properly', () => {
    expect(isDefined('')).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined(null)).toBe(true);
    expect(isDefined([])).toBe(true);

    expect(isDefined(undefined)).toBe(false);
    // @ts-ignore
    expect(isDefined()).toBe(false);
  });
});

describe('isNumber', () => {
  it('should detect numbers', () => {
    expect([0, 1].every(isNumber)).toBe(true);

    expect([[], {}].every(isNumber)).toBe(false);
    expect([0, []].every(isNumber)).toBe(false);
    expect(['', 1].every(isNumber)).toBe(false);
  });
});

describe('isPlainObj', () => {
  it('should detect plain objects', () => {
    expect([{}, {}].every(isPlainObject)).toBe(true);

    expect([[], {}].every(isPlainObject)).toBe(false);
    expect([0, []].every(isPlainObject)).toBe(false);
    expect(['', 1].every(isPlainObject)).toBe(false);
  });
});

describe('isSameType', () => {
  it('should compare types', () => {
    expect(isSameType('0', '1')).toBe(true);
    expect(isSameType([1], [])).toBe(true);
    expect(isSameType({}, { a: 1 })).toBe(true);
    expect(isSameType(0, 1)).toBe(true);

    expect(isSameType('0', [])).toBe(false);
    expect(isSameType({}, [])).toBe(false);
    expect(isSameType(1, {})).toBe(false);
    expect(isSameType('0', 1)).toBe(false);
  });
});

describe('isString', () => {
  it('should detect string', () => {
    expect(['', 'null'].every(isString)).toBe(true);

    expect([[], {}].every(isString)).toBe(false);
    expect([0, []].every(isString)).toBe(false);
    expect(['', 1].every(isString)).toBe(false);
  });
});

describe('nested', () => {
  it('should get the correct data', () => {
    expect(nested(right, 'status')).toBe('done');
    expect(nested(right, 'options.ui')).toEqual({ color: '#333', tags: ['simple', 'clean'] });
    expect(nested(right, 'options.ui.tags.0')).toBe('simple');
    expect(nested(right.options.ui.tags, 1)).toBe('clean');
    expect(nested(right, 'options.updatedAt')).toBe(1234567890);
    // @ts-ignore
    expect(nested(right.status, 1)).toBe('done');
  });
});
