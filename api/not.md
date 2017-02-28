# gun.not(callback)

Handle cases where data can't be found.

If you need to know whether a property or key exists, you can check with `.not`. It will consult the connected peers and invoke the callback if there's reasonable certainty that none of them have the data available.

> **Warning:** `.not` has no guarantees, since data could theoretically exist on an unrelated peer that we have no knowledge of. If you only have one server, and data is synced through it, then you have a pretty reasonable assurance that a `not` found means that the data doesn't exist yet. Just be mindful of how you use it.

## Callback(key)
If there's reason to believe the data doesn't exist, the callback will be invoked. This can be used as a check to prevent implicitly writing data (as described in [`.put`](../core-api/put)).

### Key
The name of the property or key that could not be found.

## Examples
Providing defaults if they aren't found
```javascript
// if not found
gun.get('players/3').not(function(key){
  // put in an object and key it
  gun.get(key).put({
    active: false
  });
}).on(handler)
// listen for changes on that key
```

Setting a property if it isn't found
```javascript
gun.get('chat').path('enabled').not(function(path){
  this.put(false)
})
```

## Chain context
`.not` does not change the context of the chain.
```javascript
gun.get(key).not(handler) /* is the same as */ gun.get(key)
```
