# gun.opt(options)

Change the configuration of the gun database instance.

The `options` argument is the same object you pass to the [constructor](constructor.md). The `options`'s properties replace those in the instance's configuration but `options.peers` are **added** to peers known to the gun instance.

## Examples
Create the gun instance.
```javascript
gun = Gun('http://yourdomain.com/gun')
```
Change UUID generator:
```javascript
gun.opt({
  uuid: function () {
    return Math.floor(Math.random() * 4294967296);
  }
});
```
Add more peers:
```javascript
gun.opt({peers: ['http://anotherdomain.com/gun']})
/* Now gun syncs with ['http://yourdomain.com/gun', 'http://anotherdomain.com/gun']. */
```
