# Gun(options)

{% video %}https://www.youtube.com/watch?v=zvo6jC1OA3Y{% endvideo %}

Used to creates a new gun database instance.

```javascript
var gun = Gun(options)
```
> **note:** `Gun` works with or without the `new` operator.

## Options

 - no parameters `undefined` creates a local datastore using the default persistence layer, either localStorage or a JSON file.

 - passing a URL `string` creates the above local datastore that also tries to sync with the URL.

   - or you can pass in an `array` of URLs to sync with multiple peers.

 - the previous options are actually aggregated into an `object`, which you can pass in yourself.

   - `options.peers` is an object, where the URLs are properties, and the value is an empty object.

   - `options.uuid` allows you to override the default 24 random alphanumeric soul generator with
      your own function.

   - `options['module name']` allows you to pass options to a 3rd party module. Their project README
     will likely list the exposed options.
     [Here is a list of such modules...](Modules)

### Examples
Sync with one peer
```javascript
Gun('http://yourdomain.com/gun')
```

Sync with many peers
```javascript
Gun(['http://server1.com/gun', 'http://server2.com/gun'])
```

Working with modules
```javascript
Gun({
  // Amazon S3 (comes bundled)
  s3: {
    key: '',
    secret: '',
    bucket: ''
  },

  // simple JSON persistence (bundled)
  // meant for ease of getting started
  // NOT meant for production
  file: 'file/path.json',

  // set your own UUID function
  uuid: function () {...}
})
```
