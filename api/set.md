# gun.set(data, callback)

Add a unique item to an unordered list.

`gun.set` works like a mathematical set, where each item in the list is unique. If the item is added twice, it will be merged. This means only objects, for now, are supported.

## Data
Data should be a gun reference or an object.
```javascript
var user = gun.get('alice').put({name: "Alice"});
gun.get('users').set(user);
```

## Callback
The callback is invoked exactly the same as `.put`, since `.set` is just a convenience wrapper around `.put`.

## Examples

```javascript
var gun = Gun();
var bob = gun.get('bob').put({name: "Bob"});
var dave = gun.get('dave').put({name: "Dave"});

dave.path('friends').set(bob);
bob.path('friends').set(dave);
```
The "friends" example is perfect, since the set guarantees that you won't have duplicates in your list.

## Chain Context
`gun.set` changes the chain context, it returns the item reference.
```javascript
gun.path('friends') /* is not the same as */ gun.path('friends').set(friend)
```

