# Aborting Tasks

If a task run takes too long, the Manager will attempt to abort it, and
potentially retry it.

## Defining timeouts

To define timeouts, every task run has a `maxDuration` configuration property.
This will have been provided when the task run was scheduled, or will have been
inherited from the task, the task's category, or the default (1000ms).

If the task run exceeds this duration, it will be considered 'aborted'. However,
you will need to write your task in such a way that this abort signal is checked
for and acted upon. (JavaScript has no way of aborting arbitrary code elsewhere
in the event loop). This is done as follows.

## Checking for abort signals

As well as its string parameter, every Task function is passed a `signal` object
as its second parameter. This is an instance of the
[`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
class, which is part of the standard JavaScript API. You can use this signal to
check if a request to abort the task run has been made by the Manager, and to
stop execution if it has.

This example creates a task that runs indefinitely, checking for an abort signal
every 10ms, and printing out when it gets aborted:

```js
import {createManager} from 'tinytick';

const manager = createManager();
manager.start();

manager.setTask('loops', async (_, signal) => {
  while (!signal.aborted) {
    await pause(10);
  }
  console.log(`Aborted!`);
});

// A convenience function for waiting asynchronously:
const pause = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
```

## Trying it out

Let's schedule this task to run as soon as possible with a `maxDuration` of
300ms:

```js
manager.scheduleTaskRun('loops', '', 0, {maxDuration: 300});
```

After 100ms (the Manager tick interval), the task run will be running:

```js
// ... wait 100ms for task run to start
console.log(manager.getRunningTaskRunIds().length);
// -> 1
```

After a further 400ms, we can be sure the task run will have been aborted:

```js
// ... wait 400ms for task run to timeout and get aborted
// -> 'Aborted!'

console.log(manager.getRunningTaskRunIds().length);
// -> 0
```

Note that, as well as checking the `aborted` property of the signal, you can
also listen for the `abort` event on the signal object using the its
`addEventListener` method.

It's also worth noting that the
[AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
object passed to a Task function is the same as that used in the
[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch)
platform function, and so you can easily make your network-based tasks abortable
by simply passing it on:

```js
manager.setTask('ping', async (url, signal) => await fetch(url, {signal}));
```

## Summary

That's a review of how TinyTick handles aborting tasks. Next, we'll look at how
to retry tasks that fail - in the Retries And Backoff guide.
