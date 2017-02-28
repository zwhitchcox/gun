# Snippets (v0.6.x)

**Table of Contents**
- [`.subscribe()` (to replace `.on()`)](#subscribe-to-replace-on)

### `.subscribe()` (to replace `.on()`)
Solves the following problem:

Suppose you have a `set` "PlayersDb" that consists of 500+ players and you want to 

* subscribe to the players personal 'score'

you could do:
```
var players = []
var lookup = {}
gun.get('playersDB').map().path('score').on(function(node,soul){

  if( ! lookup[soul]){ 
      players.push(node);
      lookup[soul] = players.length-1;
  } else {
     players[lookup[soul]].score = node.score
  }

})
```
### Pros:
* initialy all 500+ players will trigger the callback which is easy to build an initial Array
* It will trigger when a new node is added.

###  Cons: 
initialy all 500+ players will trigger the callback including the part where it's modifying the Array your building at that same moment.

## subscribe
`.subscribe()` will only call the callback when something actually changes without going through all nodes initially.

### Pros
it only triggers when the property your subscribing on changes;

### Cons:
* You can't build your initial Array with it.
* It will NOT be triggered when a new node is added.


For more information, see the thread starting at :https://gitter.im/amark/gun?at=58b48562e961e53c7f76230c

Add the following prior to instantiating Gun:
```javascript
Gun.chain.subscribe= function(cb){
  return this.on(function(data){
    var at = this._;
    if(!Gun.obj.has(at, 'subscribe')){ return at.subscribe= data }
    if(data === at.subscribe){ return } else { at.subscribe = undefined }
    this.back(1).val(cb);
  });
}
```

Instead of using `.on()`, use `.subscribe()`.  
For example,

```javascript
// subscribe to changes to each players 'score'
playersDB.map().path('score').on(function(node,soul){
   // this runs for every player initialy
})
```
would be:
```javascript
// subscribe to changes to each players 'score'
playersDB.map().path('score').subscribe(function(node,soul){ 
    // this runs only when property 'score' changes
})
```
So remember that `.subscribe()` is just doing that...subscribing. You can NOT use it to build your initial Array, for that you can use 'valMapEnd' or 'each'
