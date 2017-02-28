# gun.put(data, callback)

{% video %}https://www.youtube.com/watch?v=QLg-Z-y5sVo{% endvideo %}

Save data into gun, syncing it with your connected peers.

It has three parameters, and only the first is required:

 1. `data` to save
 2. an optional `callback`, invoked on each acknowledgment

`gun.get('key').put({hello: "world"}, function(ack){})`

You do not need to re-save the entire object every time, gun will automatically merge your data into what already exists as a "partial" update.

## Allowed types

`.put` restricts the input to a specific subset:

 - `objects`:
   [partial](../more-about-gun/how-writes-are-handled.md#partials),
   [circular](../more-about-gun/how-writes-are-handled.md#circular-references), and nested
 - `strings`
 - `numbers`
 - `booleans`
 - `null`

Other values, like `undefined`, `NaN`, `Infinity`, `arrays`, will be rejected.

> Traditional arrays are dangerous in real-time apps. Use [gun.set](../api/set) instead.

> **Note:** when using `.put`, if any part of the chain does not exist yet, it will implicitly create it as an empty object.
```javascript
gun.get('something').path('that.does.not.exist.yet').put("Hello World!");
// `.put` will if needed, backwards create a document
// so "Hello World!" has a place to be saved.
```

## Callback(ack)
  
 - `ack.err`, if there was an error during save.
 - `ack.ok`, if there was a success message (none is required though).

The `callback` is fired for each peer that responds with an error or successful persistence message, including the local cache. Acknowledgement can be slow, but the write propagates across networks as fast as the pipes connecting them.

If the error property is undefined, then the operation succeeded, although the exact values are left up to the module developer.

## Examples

Saving objects
```javascript
gun.get('key').put({
  property: 'value',
  object: {
    nested: true
  }
})
```

Saving primitives
```javascript
// strings
gun.get('person').path('name.first').put('Alice')

// numbers
gun.get('IoT').path('temperature').put(58.6)

// booleans
gun.get('player').path('alive').put(true)
```

Using the callback
```javascript
gun.get('survey').path('submission').put(submission, function(ack){
  if(ack.err){
    return ui.show.error(ack.err)
  }
  ui.show.success(true)
})
```

## Chain context
`gun.put` does not change the gun context.
```javascript
gun.get('key').put(data) /* same context as */ gun.get('key')
```

## Unexpected behavior

You cannot save primitive values at the root level.
```javascript
Gun().put("oops");
```
All data is normalized to a parent node.
```javascript
Gun().put({foo: 'bar'}); // internally becomes...
Gun().get(randomUUID).put({foo: 'bar'});

Gun().get('user').path('alice').put(data); // internally becomes...
Gun().get('user').put({'alice': data});
// An update to both user and alice happens, not just alice.
```
You can save a gun chain reference,
```javascript
var ref = Gun().put({text: 'Hello world!'})
Gun().get('message').path('first').put(ref)
```
But you cannot save it inline.
```javascript
var sender = Gun().put({name: 'Tom'})
var msg = Gun().put({
  text: 'Hello world!',
  sender: sender // this will fail
})
// however
msg.path('sender').put(sender) // this will succeed
``` 
Be careful saving deeply nested objects,
```javascript
Gun().put({
  foo: {
    bar: {
      lol: {
        yay: true
      }
    }
  }
}):
```
For the most part, gun will handle this perfectly fine. It will attempt to automatically merge every nested object as a partial. However, if it cannot find data (due to a network failure, or a peer it has never spoken with) to merge with it will generate new random UUIDs. You are unlikely to see this in practice, because your apps will probably save data based on user interaction (with previously loaded data). But if you do have this problem, consider giving each one of your sub-objects a deterministic ID.

