# Using Amazon S3 for Storage

You need to use this Amazon S3 policy (replace both "YOURBUCKETHERE" with the S3 bucket you make/have for this app):

```javascript
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::YOURBUCKETHERE",
                "arn:aws:s3:::YOURBUCKETHERE/*"
            ]
        }
    ]
}
```

For your Amazon IAM User (in Security Credential's admin dashboard, create a custom policy first then create a new user, select it and attach that policy to it) that is associated with that user's Access Key and Secret Access Key from when you initialize GUN on the server:

```javascript
var gun = Gun({
  file: 'data.json', // local testing and development
  s3: {
    key: process.env.AWS_ACCESS_KEY_ID, // AWS Access Key
    secret: process.env.AWS_SECRET_ACCESS_KEY, // AWS Secret Token
    bucket: process.env.AWS_S3_BUCKET // The bucket you want to save into
  }
});
```
Remember that your app needs to have these ENVIRONMENT VARIABLES available to them.

If you are using Heroku, this is pretty easy. In their dashboard go and edit your app's ENVIRONMENT VARIABLE CONFIGs to the actual key, token, and bucket.

If you are running your own server, you probably have an upstart script or something similar that monitors your app and starts or restarts it if it crashes. You can set ENVIRONMENT VARIABLES there, exactly how depends upon your setup so please google around for that - when we have a good one, we'll update it here.
