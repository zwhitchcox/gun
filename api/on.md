# gun.on(callback, options)

{% video %}https://www.youtube.com/watch?v=UDZGVYLNLAU{% endvideo %}

Subscribe to updates and changes on a node or property in realtime.

## Callback(data, key)
When the property or node you're focused on changes, this callback is immediately fired with the data as it is at that point in time.

Since gun streams data, the callback will probably be called multiple times as new chunk comes in.

## Option
Currently, the only option is to filter out old data, and just be given the changes. If you're listening to a node with 100 fields, and just one changes, you'll instead be passed a node with a single property representing that change rather than the full node every time.

**Longhand syntax**
```javascript
gun.get('foo').on(callback, {
  change: true
})
```

**Shorthand syntax**
```javascript
gun.get('foo').on(callback, true)
```

## Examples
Listening for updates on a key
```javascript
gun.get('users').path(username).on(function(user){
  // update in real-time
  if (user.online) {
    view.show.active(user.name)
  } else {
    view.show.offline(user.name)
  }
})
```

Listening to updates on a field
```javascript
gun.get('lights').path('living room').on(function(state, room){
  // update the UI when the living room lights change state
  view.lights[room].show(state)
})
```

## Chain Context
`gun.on` does not change the chain context.
```javascript
gun.get(key).on(handler) /* is the same as */ gun.get(key)
```

## Unexpected behavior

Data is only 1 layer deep, a full document is not returned (there are extensions available that do that), this helps keep things fast.

It will be called many times.
