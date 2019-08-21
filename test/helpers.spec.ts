// @ts-ignore
import {
  canHaveLength,
  compareNumbers,
  getIterables,
  isArray,
  isNumber,
  isPlainObj,
  isSameType,
  isString,
} from '../src/helpers';

const left = {
  data: [],
  options: {},
  ratio: 0.8,
  retries: 0,
  status: 'idle',
  version: 1,
};

const right = {
  data: [{ a: 1 }],
  options: {},
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

describe('getIterables', () => {
  it('should get iterables', () => {
    expect(getIterables(left, right, { key: 'data' })).toEqual([[], [{ a: 1 }]]);
    expect(getIterables(left, right, { key: 'options' })).toEqual([[], []]);
    expect(getIterables(left, right, { key: 'status' })).toEqual(['idle', 'done']);
  });

  it('should throw for invalid types', () => {
    expect(() => getIterables(left, right, { key: 'version' })).toThrow(
      'Inputs have different types',
    );

    expect(() => getIterables(left, right, { key: 'ratio' })).toThrow("Inputs dont't have length");

    expect(() => getIterables(left, right, { exclude: 'string', key: 'status' })).toThrow(
      'Strings are excluded',
    );
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
    expect([{}, {}].every(isPlainObj)).toBe(true);

    expect([[], {}].every(isPlainObj)).toBe(false);
    expect([0, []].every(isPlainObj)).toBe(false);
    expect(['', 1].every(isPlainObj)).toBe(false);
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
