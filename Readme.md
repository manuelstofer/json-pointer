# json-pointer

[![Build Status](https://travis-ci.org/manuelstofer/json-pointer.png)](https://travis-ci.org/manuelstofer/json-pointer)

Some utilities for JSON pointers described by RFC 6901

Provides some additional stuff i needed but is not included in [node-jsonpointer](https://github.com/janl/node-jsonpointer)


## Installation

[node.js](http://nodejs.org)

```bash
$ npm install json-pointer
```

[component](https://github.com/component/component)

```bash
$ component install manuelstofer/json-pointer
```


## API

```Javascript
var pointer = require('json-pointer');
```

### pointer(object, [pointer, [value]])

Convenience wrapper around the api.

Calls `.get` when called with an `object` and a `pointer`.
Calls `.set` when also called with `value`.
If only `object` is supplied, it returns a partially applied function, mapped to the object.


```Javascript
var obj = {
    existing: 'bla'
};

pointer(obj, '/new-value/bla', 'expected'); // .set a property
var objPointer = pointer(obj); // all api calls are now scoped to `obj`
objPointer('/existing') // gets '/existing' from `obj`
objPointer('/new-value/bla') // gets '/new-value/bla' from `obj`
```

The wrapper supports chainable object oriented style.

```Javascript
var obj = {anything: 'bla'};
var objPointer = pointer(obj);
objPointer.set('/example', 'bla').dict();
```


### .get(object, pointer)

Looks up a JSON pointer in an object.

```Javascript
var obj = {
    example: {
        bla: 'hello'
    }
};
pointer.get(obj, '/example/bla');
```


### .set(object, pointer, value)

Sets a new value on object at the location described by pointer.

```Javascript
var obj = {};
pointer.set(obj, '/example/bla', 'hello');
```


### .remove(object, pointer)

Removes an attribute of object referenced by pointer

```Javascript
var obj = {
    example: 'hello'
};
pointer.remove(obj, '/example');
// obj -> {}
```


### .dict(object)

Creates a dictionary object (pointer -> value).

```Javascript
var obj = {
    hello: {bla: 'example'}
};
pointer.dict(obj);

// Returns:
// {
//    '/hello/bla': 'example'
// }
```


### .walk(object, iterator)

Just like:

```Javascript
each(pointer.dict(obj), iterator);
```


### .has(object, pointer)

Tests if an object has a value for a JSON pointer.

```Javascript
var obj = {
    bla: 'hello'
};

pointer.has(obj, '/bla');               // -> true
pointer.has(obj, '/non/existing');      // -> false
```


### .escape(str)

Escapes a reference token.

```Javascript
pointer.escape('hello~bla');            // -> 'hello~0bla'
pointer.escape('hello/bla');            // -> 'hello~1bla'
```


### .unescape(str)

Unescape a reference token.

```Javascript
pointer.unescape('hello~0bla');         // -> 'hello~bla'
pointer.unescape('hello~1bla');         // -> 'hello/bla'
```


### .parse(str)

Converts a JSON pointer into an array of reference tokens.

```Javascript
pointer.parse('/hello/bla');            // -> ['hello', 'bla']
```


### .compile(str)

Builds a json pointer from an array of reference tokens.

```Javascript
pointer.compile(['hello', 'bla']);      // -> '/hello/bla'
```
