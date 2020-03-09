export type AcceptedTypes = string | boolean | number | GenericObject;
export type Data = GenericObject | GenericObject[];
export type Key = string | number;
export type Value = AcceptedTypes | AcceptedTypes[];

export type Comparator = Array<string | any[]>;

export interface GenericObject {
  [key: string]: any;
}

export interface Params {
  actual?: Value;
  exclude?: string;
  key: Key;
  previous?: Value;
}

export type TreeChangesFn = (previousData: Data, data: Data) => TreeChanges;

export interface TreeChanges {
  added: (key?: Key, compare?: any) => boolean;
  changed: (key?: Key, actual?: Value, previous?: Value) => boolean;
  changedFrom: (key: Key, previous: Value, actual?: Value) => boolean;
  changedTo: (key: Key, actual: Value) => boolean;
  decreased: (key: Key, actual?: Value, previous?: Value) => boolean;
  emptied: (key?: Key) => boolean;
  filled: (key?: Key) => boolean;
  increased: (key: Key, actual?: Value, previous?: Value) => boolean;
  removed: (key?: Key) => boolean;
}
