# gun.path(key)

{% video %}https://www.youtube.com/watch?v=UDZGVYLNLAU{% endvideo %}

Path does the same thing as `get` but has some conveniences built in.

## Key
The key `property` is the name of the field to move to.

```javascript
// move to the "themes" field on the settings object
gun.get('settings').path('themes')
```

Once you've changed the context, you can read, write, and `path` again from that field. While you can just chain one `path` after another, it becomes verbose, so there are two shorthand styles:

 - dot format
 - array format

Here's dot notation in action:
```javascript
// verbose
gun.get('settings').path('themes').path('active')

// shorthand
gun.get('settings').path('themes.active')
```

And the array format, which really becomes useful when using variables instead of literal strings:
```javascript
gun.get('settings').path(['themes', themeName])
```

### Unexpected behavior
The dot notation can do some strange things if you're not expecting it. Under the hood, everything is changed into a string, including floating point numbers. If you use a decimal in your path, it will split into two paths...
```javascript
gun.path(30.5)
// interprets to
gun.path(30).path(5)
```

This can be especially confusing as the chain might never resolve to a value.

> Note: For users upgrading from versions prior to v0.5.x, `path` used to be necessary - now it is purely a convenience wrapper around `get`.

## Examples
Navigating to a property
```javascript
/*
  where `user` is {
    name: 'Bob'
  }
*/
gun.get('user').path('name')
```
Once you've focused on the `name` property, you can chain other methods like [`.put`](../core-api/put) or [`.on`](on) to interact with it.

Moving through multiple properties
```javascript
/*
  where `user` is {
    name: { first: 'bob' }
  }
*/
gun.get('user').path('name').path('first')
// or the shorthand...
gun.get('user').path('name.first')
```

## Chain context
`gun.path` creates a new context each time it's called, and is always a result of the previous context.
```javascript
gun.get('API').path('path').path('chain')
/* is different from */
gun.get('API').path('path')
/* and is different from */
gun.get('API')
```

