# gun.map(callback)

{% video %}https://www.youtube.com/watch?v=F2FSMsxMSic{% endvideo %}
Map iterates over each property and item on a node, passing it down the chain, behaving like a forEach on your data. It also subscribes to every item as well and listens for newly inserted items. It accepts one argument:

 - a `callback` function that transforms the data as it passes through. If the data is transformed to `undefined` it gets filtered out of the chain.

> Note: As of `v0.6.x` the transform function is in experimental mode. Please play with it and report bugs or suggestions on how it could be improved to be more useful.

## Examples
Iterate over an object
```javascript
/*
  where `stats` are {
    'new customers': 35,
    'returning': 65
  }
*/
gun.get('stats').map().on(function(percent, category) {
  pie.chart(category, percent)
})
```
Or `forEach`ing through every user.
```javascript
gun.get('users').map().val(function(user, id){
  ui.list.user(user);
});
```

## Chain context
`.map` changes the context of the chain to hold many chains simultaneously. Check out this example:
```javascript
gun.get('users').map().path('name').on(cb);
```
Everything after the `map()` will be done for every item in the list, such that you'll get called with each name for every user in the list. This can be combined in really expressive and powerful ways.
```javascript
gun.get('users').map().path('friends').map().path('pet').on(cb);
```
This will give you each pet of every friend of every user!

```javascript
gun.get(key).map() /* is not the same as */ gun.get(key)
```
