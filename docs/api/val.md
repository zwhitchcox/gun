# gun.val(callback, options)

<a href="https://youtu.be/k-CkP43-uJo" title="GUN val"><img src="http://img.youtube.com/vi/k-CkP43-uJo/0.jpg" width="425px"></a><br>

Get the current data without subscribing to updates.

## Option

 - `wait` controls the asynchronous timing (see unexpected behavior, below). `gun.get('foo').val(cb, {wait: 0})`

## Callback(data, key)
The data is the value for that chain at that given point in time. And they key is the last property name or ID of the node.

## Examples
```javascript
gun.get('peer').path(userID).path('profile').val(function(profile){
  // render it, but only once. No updates.
  view.show.user(profile)
})
```

Reading a property
```javascript
gun.get('IoT').path('temperature').val(function(number){
  view.show.temp(number)
})
```

## Chain Context
`gun.val` does not currently change the context of the chain, but it is being discussed for future versions that it will - so try to avoid chaining off of `.val` for now. This feature is now in experimental mode with `v0.6.x`, but only if `.val()` is not passed a callback. A useful example would be `gun.get('users').val().map().on(cb)` this will tell gun to get the current users in the list and subscribe to each of them, but not any new ones. Please test this behavior and recommend suggestions.

## Unexpected behavior

`.val` is synchronous and immediate (at extremely high performance) if the data has already been loaded.

`.val` is asynchronous and on a **debounce timeout** while data is still being loaded - so it may be called completely out of order compared to other functions. This is intended because gun streams partials of data, so `val` avoids firing immediately because it may not represent the "complete" data set yet. You can control this timeout with the `wait` option.

Data is only 1 layer deep, a full document is not returned (there are extensions available that do that), this helps keep things fast.

