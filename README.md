tree-changes
===

[![NPM version](https://badge.fury.io/js/tree-changes.svg)](https://www.npmjs.com/package/tree-changes) [![build status](https://travis-ci.org/gilbarbara/tree-changes.svg)](https://travis-ci.org/gilbarbara/tree-changes) [![Maintainability](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/maintainability)](https://codeclimate.com/github/gilbarbara/tree-changes/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/93528e49029782f5f7d2/test_coverage)](https://codeclimate.com/github/gilbarbara/tree-changes/test_coverage)

Get changes between two versions of data with similar shape.

## Setup

```bash
npm install tree-changes
```

## Usage

```js
import treeChanges from 'tree-changes';

const savedData = {
  actions: {},
  data: { a: 1 },
  hasData: false,
  items: [{ name: 'test' }],
  messages: [],
  missing: 'username',
  pristine: true,
  ratio: 0.9,
  retries: 0,
  sort: {
    data: [{ type: 'asc' }, { type: 'desc' }],
    status: 'idle',
  },
  switch: false,
  username: '',
};

const newData = {
  actions: { complete: true },
  data: {},
  hasData: true,
  items: [],
  messages: ['New Message'],
  missing: '',
  ratio: 0.5,
  retries: 1,
  sort: {
    data: [{ type: 'desc' }, { type: 'asc' }],
    status: 'success',
  },
  sudo: true,
  username: 'John',
};

const {
  added,
  changed,
  changedFrom,
  decreased,
  emptied,
  filled,
  increased,
  removed,
} = treeChanges(savedData, newData);

changed(); // true

changed('hasData'); // true
changed('hasData', true); // true
changed('hasData', true, false); // true
changed('actions', { complete: true }, {})

// support nested match
changed('sort.data.0.type', 'desc'); // true

changedFrom('hasData', false); // true
changedFrom('hasData', false, true); // true

changedFrom('retries', 0); // true
changedFrom('retries', 0, 1); // true

// works with array values too
changedFrom('sort.status', 'idle', ['done', 'success']); // true

added('actions'); // true
added('messages'); // true
added('sudo'); // true

removed(); // true
removed('data'); // true
removed('items'); // true
removed('switch'); // true

filled('actions'); // true
filled('messages'); // true
filled('username'); // true

emptied('data'); // true
emptied('items'); // true
emptied('missing'); // true

decreased('ratio'); // true

increased('retries'); // true
```

####  Works with arrays too.

```js
import treeChanges from 'tree-changes';

const { changed } = treeChanges([0, { id: 2 }], [0, { id: 4 }]);

changed(); // true
changed(0); // false
changed(1); // true
changed('1.id', 4); // true
```

> It uses [deep-diff](https://github.com/flitbit/diff) to compare objects/arrays and [nested-property](https://github.com/cosmosio/nested-property) to get the nested key.

## API

**added**(`key: Key`)  
Check if something was added to the data (length has increased). Works with arrays and objects (using Object.keys).

**changed**(`key?: Key`, `actual?: Value`, `previous?: Value`)  
Check if the data has changed.  
It also can compare to the `actual` value or even with the `previous`.

**changedFrom**(`key: Key`, `previous: Value`, `actual?: Value`)  
Check if the data has changed from `previous` or from `previous` to `actual`. 

**decreased**(`key: Key`, `actual?: Value`, `previous?: Value`)  
Check if both values are numbers and the value has decreased.  
It also can compare to the `actual` value or even with the `previous`.

**emptied**(`key: Key`)  
Check if the data was emptied. Works with arrays, objects and strings.

**filled**(`key: Key`)  
Check if the data was filled (from a previous empty value). Works with arrays, objects and strings.

**increased**(`key: Key`, `actual?: Value`, `previous?: Value`)  
Check if both values are numbers and the value has increased.  
It also can compare to the `actual` value or even with the `previous`.

**removed**(`key: Key`)  
Check if something was removed from the data (length has decreased). Works with arrays and objects (using Object.keys).

> **Types**
> type Key = string | number;  
> type AcceptedTypes = string | boolean | number | { [key: string]: any };  
> type Value = AcceptedTypes | AcceptedTypes[];  

## With React

### Class components

```js
import treeChanges from 'tree-changes';

class Comp extends React.Component {
    ...
    componentDidUpdate(prevProps) {
        const { changed, changedFrom } = treeChanges(prevProps, this.props);
        
        if (changedFrom('retries', 0, 1) {
            // dispatch some error
        }
        
        if (changed('hasData', true)) {
            // send data to analytics or something.
        }
    }
    ...
}
```

### Functional components with hooks

```jsx
import React, { useEffect, useRef } from 'react';
import treeChanges from 'tree-changes';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

function useTreeChanges(props) {
  const prevProps = usePrevious(props) || {};

  return treeChanges(prevProps, props);
}

const Page = (props) => {
  const { changed } = useTreeChanges(props);

  if (changed('isLoaded', true)) {
    sendAnalyticsEvent('load', 'MySuperPage')
  }

  return <div>...</div>;
};
```

## License

MIT 