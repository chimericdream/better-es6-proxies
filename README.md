## ProxyMate

[![Version 0.4.0](https://img.shields.io/badge/version-0.4.0-brightgreen.svg)](https://github.com/chimericdream/proxy-mate) [![Build Status](https://travis-ci.org/chimericdream/proxy-mate.svg?branch=master)](https://travis-ci.org/chimericdream/proxy-mate)

### Introduction

This library provides a wrapper for ES6 Proxies that can be used to emulate protected class properties as well as provide data encapsulation.

### Examples

```javascript
class SimpleClass {
    constructor() {
        this.data = {
            'propA': 'this is prop a',
            'propB': 'this is prop b'
        };
    }
}

// Simple data encapsulation
let obj1 = proxy(new SimpleClass(), [], ['data']);
console.log(obj1.propA); // 'this is prop a'
console.log(obj1.data.propA); // 'this is prop a'
obj1.propA = 'prop a has changed';
console.log(obj1.propA); // 'prop a has changed'
console.log(obj1.data.propA); // 'prop a has changed'

// Data encapsulation with read-only members
let obj2 = proxy(new SimpleClass(), ['data'], ['data']);
console.log(obj2.propA); // 'this is prop a'
console.log(obj2.data.propA); // 'this is prop a'
obj2.propA = 'prop a is read-only'; // throws exception
console.log(obj2.propA); // 'this is prop a'
console.log(obj2.data.propA); // 'this is prop a'

// Complex example with a nested proxy
let obj3 = proxy(new SimpleClass(), ['data'], ['data']);
let obj4 = proxy(new SimpleClass(), [], ['data']);
obj3.nested = obj4;

console.log(obj3.propA); // 'this is prop a'
console.log(obj3.data.propA); // 'this is prop a'
console.log(obj3.nested.propA); // 'this is prop a'
console.log(obj3.nested.data.propA); // 'this is prop a'

obj3.propA = 'prop a is read-only'; // throws exception
obj3.nested.propA = 'prop a of the inner proxy can be modified';
console.log(obj3.nested.propA); // 'prop a of the inner proxy can be modified'
console.log(obj3.nested.data.propA); // 'prop a of the inner proxy can be modified'
```

Classes can also be proxied automatically in the constructor.

```javascript
// Typically, value objects should not be modifiable once created
class ValueObject {
    constructor(sourceData = {}) {
        this.data = sourceData;
        return proxy(this, ['data'], ['data']);
    }
}
```

You don't have to use ES6 classes, either. Plain objects are ok too!

```javascript
const getObj = () => ({
    propA: 'this is prop a',
    propB: 'this is prop b',
    nested: {
        propC: 'this is nested.propC',
    },
});

// Make a pure value object by marking everything read-only
let obj4 = proxy(getObj(), '*');
obj4.propA = 'prop a is read-only'; // throws exception
obj4.propB = 'prop b is read-only'; // throws exception
obj4.nested.propC = 'even nested props are read-only'; // throws exception
```

### License

MIT License. See [LICENSE.md](https://github.com/chimericdream/proxy-mate/blob/master/LICENSE.md) for the complete license text.
