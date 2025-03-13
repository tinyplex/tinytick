# Retries And Backoff

Since a task run can be aborted (if it times out) or throw an error, it's useful
for the Manager to be able to retry it - and you can completely control how many
times a task run is retried until it is successful, and how long to wait between
each retry.

## Configuring retries

The relevant configuration properties are `maxRetries` and `retryDelay`. These
will have been provided when the task run was scheduled, or will have been
inherited from the task or the task's category. The default `maxRetries` value
is zero, so you will have to explicitly increase that to get retry behavior.

To demonstrate things, first let's set up a Manager:

```js
import {createManager} from 'tinytick';

const manager = createManager();
manager.start();
```

The following then defines a task called 'tryMe' that will throw an error the
first two times it is run. We also configure it to retry three times by default,
with 200ms between each retry:

```js
manager.setTask(
  'tryMe',
  async (arg, signal, {retry}) => {
    if (retry < 2) {
      console.log(`Attempt ${retry + 1}. Try again!`);
      throw new Error();
    }
    console.log('Success!');
  },
  '',
  {maxRetries: 2, retryDelay: 200},
);
```

Notice how we are using the TaskRunInfo object that gets passed into the task
function to keep track of which retry this is.

Let's schedule it:

```js
manager.scheduleTaskRun('tryMe');
```

After waiting 100ms (the Manager tick interval), the task run will start, and
immediately error:

```js
// ... wait 100ms for task run to start
// -> 'Attempt 1. Try again!'
```

We can expect the task run to be retried after 200ms:

```js
// ... wait 200ms to be sure task run is retried once
// -> 'Attempt 2. Try again!'
```

And the third time, we expect it to succeed!

```js
// ... wait 200ms to be sure task run is retried once more
// -> 'Success!'
```

## Backing off

In the example above, we simply retry the task 3 times with a fixed delay of
200ms between each attempt. In the real world you may want to 'back off' the
retries so that you do not, for example, flood a resource that is not available
with repetitive requests.

To do this, you can provide a `retryDelay` configuration property as not a
number (in milliseconds), but a string of comma-delimited intervals. These will
be used in sequence for each retry attempt. For example, to retry the task from
above with delays of 100ms, 200ms, and 400ms (an exponential backoff, of sorts),
you would set the string to '100,200,400'.

Let's schedule our task again, but this time with a backoff sequence that
retries once quickly, and then once more slowly:

```js
manager.scheduleTaskRun('tryMe', '', 0, {retryDelay: '100,400'});
```

(In reality, a `retryDelay` property like this would probably be defined for the
task as a whole. Here we are just setting it for one run for clarity.)

But now let's wait for the task to run and retry again.

```js
// ... wait 100ms for task run to start
// -> 'Attempt 1. Try again!'
// ... wait 200ms to be sure task run is retried once
// -> 'Attempt 2. Try again!'
// ... wait 200ms - but this is not long enough for the second retry
// -> /* nothing logged */
// ... wait 200ms once more - now long enough for the second retry
// -> 'Success!'
```

Note that if you configure a task to run with more possible retries than there
are entries in the `retryDelay` string, the last entry will be used for the
remainder of the retries. In other words, this:

```js
manager.scheduleTaskRun('tryMe', '', 0, {
  maxRetries: 4,
  retryDelay: '100,200,400',
});
```

Would result in intervals of 100ms, 200ms, 400ms, then 400ms between attempts.

## Summary

TinyTick provides some simple but powerful tools for retrying tasks that fail,
by allowing you to configure the number of retries and the delay between each
retry. You can also use a backoff strategy to prevent overwhelming a resource
with repeated requests.

And now, let's conclude with the Starting And Stopping guide!
