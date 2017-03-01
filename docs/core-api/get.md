# gun.get(key)

Where to read data from.

<a href="https://youtu.be/wNrIrrLffs4" title="GUN get"><img src="http://img.youtube.com/vi/wNrIrrLffs4/0.jpg" width="425px"></a><br>

It takes three parameters:

 - `key`
 - `callback`

`gun.get('key').get('property', function(ack){})`

You will usually be using [gun.on](#on) or [gun.val](#val) to actually retrieve your data, not this `callback` (it is intended for more low level control, for module and extensions).

## Key
The `key` is the ID or property name of the data that you saved from earlier (or that will be saved later).

> Note that if you use `.put` at any depth after a `get` it first reads the data and then writes, merging the data as a partial update.

```javascript
gun.get('key').put({property: 'value'})

gun.get('key').on(function(data, key){
  // {property: 'value'}, 'key'
})
```

## Callback(ack)

 - `ack.put`, the raw data.
 - `ack.get`, the key, ID, or property name of the data.

The callback is a listener for read errors, not found, and updates. It may be called multiple times for a single request, since gun uses a reactive streaming architecture. Generally, you'll find [`.not`](#not), [`.on`](#on), and [`.val`](#val) as more convenient for every day use. Skip to those!

```javascript
gun.get(key, function(ack){
  // called many times
})
```

## Examples

Retrieving a key
```javascript
// retrieve all available users
gun.get('users').map().on(ui.show.users)
```

Using the callback
```javascript
gun.get(key, function(ack){
  if(ack.err){
    server.log(error)
  } else
  if(!ack.put){
    // not found
  } else {
    // data!
  }
})
```

## Chain context
Chaining multiple `get`s together changes the context of the chain, allowing you to access, traverse, and navigate a graph, node, table, or document.

> Note: For users upgrading versions, prior to v0.5.x `get` used to always return a context from the absolute root of the database. If you want to go back to the root, either save a reference `var root = Gun();` or now use [`.back(-1)`](#back).

```javascript
gun.get('user').get('alice') /* same context as */ gun.get('users').path('alice')
```

## Unexpected behavior

Most callbacks in gun will be called multiple times.
