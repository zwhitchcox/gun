# gun.back(amount)

Move up to the parent context on the chain.

Every time a new chain is created, a reference to the old context is kept to go `back` to.

## Amount

The number of times you want to go back up the chain. `-1` or `Infinity` will take you to the root.

## Examples
Moving to a parent context
```javascript
gun.get('users')
  /* now change the context to alice */
  .get('alice')
  .put(data)
  /* go back up the chain once, to 'users' */
  .back().map(...)
```

Another example
```javascript
gun.get('player').path('game.score').back(1)
// is the same as...
gun.get('player').path('game')
```

## Chain context
The context will always be different, returning you to the
```javascript
gun.get('key').get('property')
/* is not the same as */
gun.get('key').get('property').back()
```
