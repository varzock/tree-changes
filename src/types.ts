export type AcceptedTypes = string | boolean | number | PlainObject;
export type Comparator = Array<string | any[]>;
export type Data = PlainObject | AcceptedTypes[];
export type Key = string | number;
export type Value = AcceptedTypes | AcceptedTypes[];

export interface PlainObject {
  [key: string]: any;
}

export interface Params {
  actual?: Value;
  includeStrings?: boolean;
  filter?: boolean;
  key: Key;
  previous?: Value;
}

export type TreeChangesFn = (previousData: Data, data: Data) => TreeChanges;

export interface TreeChanges {
  added: (key?: Key, value?: Value) => boolean;
  changed: (key?: Key, actual?: Value, previous?: Value) => boolean;
  changedFrom: (key: Key, previous: Value, actual?: Value) => boolean;
  changedTo: (key: Key, actual: Value) => boolean;
  decreased: (key: Key, actual?: Value, previous?: Value) => boolean;
  emptied: (key?: Key) => boolean;
  filled: (key?: Key) => boolean;
  increased: (key: Key, actual?: Value, previous?: Value) => boolean;
  removed: (key?: Key, value?: Value) => boolean;
}
