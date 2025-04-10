# Starting And Stopping

We finish with a relatively simple topic, but one that has some important
behaviors worth mentioning.

## The Manager is stopped by default

When you create a Manager object, it is stopped. This means that it will not
start its tick sequence, and so will not run any tasks until you explicitly
start it. This is useful if you want to do some setup (such as registering
tasks) before you start running any at all.

```js
import {createManager} from 'tinytick';

const stoppedManager = createManager();
console.log(stoppedManager.getStatus());
// -> 0 /* stopped */
```

One common pattern is to create the Manager, register tasks, and then start it
using the start method, possibly all in a single fluent statement:

```js
const manager = createManager()
  .setTask('hello', async () => console.log('Hello!'))
  .setTask('ping', async (url) => fetch(url))
  .start();
```

## Stopping the Manager

As you might guess, the stop method is responsible for stopping the Manager.
This will halt the tick sequence, and so no further tasks will be run until you
start the Manager again.

This is an important clean up step up in your application since the Manager
maintains timeout handles that might (in the case of a Node app for example)
keep the process alive indefinitely.

But it's important to note that there are two ways to stop the Manager. By
default, it won't stop immediately, and will wait until all scheduled tasks have
been run.

This will start the 'hello' task in 200ms' time:

```js
manager.scheduleTaskRun('hello', '', 200);
```

But if the Manager is stopped, it will remain in the 'stopping' status for 200ms
until the task run has been executed. Only then will it be stopped:

```js
manager.stop();
console.log(manager.getStatus());
// -> 2 /* stopping */

// ... wait 300ms to be sure the task run completes
// -> 'Hello!'

console.log(manager.getStatus());
// -> 0 /* stopped */
```

## Stopping immediately

If this is undesirable, you can force the Manager to stop immediately by passing
`true` into the stop method:

```js
manager.start(); // start it again

manager.scheduleTaskRun('hello', '', 200);
manager.stop(true);

console.log(manager.getStatus());
// -> 0 /* stopped */
```

This won't kill any tasks that are currently running, but it will prevent any
future scheduled task runs from starting.

Note however, that regardless of how you stop the Manager, scheduled task runs
will remain in the queue, and will get executed again when it starts up.

```js
console.log(manager.getScheduledTaskRunIds().length);
// -> 1

manager.start();

// ... wait 300ms to be sure the task run completes
// -> 'Hello!'
```

## You can't schedule task runs when the Manager is stopping

Finally, it's important to note that while the Manager is in its 'stopping'
state, no new task runs can be scheduled. This for the case in which a task
recursively schedules a new run of itself. Consider this:

```js
manager.setTask('recurse', async () => manager.scheduleTaskRun('recurse'));
```

With a task like this, the Manager might never stop - since every time it
finishes one task run, another has appeared! So attempts to call the
scheduleTaskRun method when the Manager is stopping will return an undefined
task run Id and nothing added to the schedule.

## Summary

OK, we're done with looking at how the Manager can start and stop. And now
you've learned about all of TinyTick's functionality! We hope you've found these
useful, and now you need to get out there and start using it.

To finish off, in the Example Use Cases guides, we look at some common problems
that TinyTick can solve.
