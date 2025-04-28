# Scheduling Tasks

This guide shows you how to schedule tasks to run in TinyTick.

In the Defining Tasks guide, you learned how to define tasks and set their
configuration. Now you will see how to schedule these tasks to run at specific
times.

## A quick word about timestamps & durations

TinyTick uses numbers to indicate when to schedule tasks, and they always
represent a number of milliseconds. _BUT_ there's an important thing to
understand about these values when passed in to schedule a task run:

- If the number used is greater than the number of milliseconds in a single year
  (31536000000), TinyTick will interpret it as meaning 'milliseconds since the
  start of 1970'. These are absolute timestamps (represented by the TimestampMs
  type).
- If the number used is less than or equal to the number of milliseconds in a
  single year, TinyTick will interpret it as meaning 'milliseconds from now'.
  These are relative durations (represented by the DurationMs type).

This allows you to easily schedule tasks to run at specific times in the future,
_or_ some reasonable interval from the present. It is not expected that TinyTick
will be used to schedule things for more than a year in the future though you
can just create an absolute timestamp to do so if you need.

## Scheduling a task run

To schedule a task to run, you simply use the scheduleTaskRun method of the
Manager. It has one mandatory parameter, which is the task Id of the task you
want to run. Here we create a Manager, start it, register a task called `ping`,
and schedule it:

```js
import {createManager} from 'tinytick';

const manager = createManager();
manager.start();

manager.setTask('ping', async () => await fetch('https://example.org'));
manager.scheduleTaskRun('ping');
// ... wait 100ms (the Manager tickInterval) for task run to start
```

That's it! Since we didn't provide a timestamp, TinyTick will run the task as
soon as the next tick comes around (by default within 100ms).

## Scheduling a task with a parameter

As we saw in the Defining Tasks guide, you can configure a task to accept a
single string parameter when it is run. This is useful when you want to run the
same task with different inputs. This is provided as the second argument the
scheduleTaskRun method:

```js
manager.setTask('ping', async (url) => await fetch(url));

manager.scheduleTaskRun('ping', 'https://tinytick.org');
```

This means you can schedule multiple similar tasks where only the single
parameter varies.

## Scheduling a task to run at a specific time

If you want to schedule a task to run at a specific time, you can provide a
timestamp as the third argument to the scheduleTaskRun method. As we saw above,
this can be an absolute timestamp (if greater than 31536000000) or a relative
duration (otherwise), both in milliseconds:

```js
manager.scheduleTaskRun('ping', 'https://tinybase.org', 1000);
manager.scheduleTaskRun('ping', 'https://tinytick.org', 2000);

const birthday = Date.parse('2024-04-28 00:00:00'); // 1745827200000
manager.scheduleTaskRun('ping', 'https://tripleodeon.com', birthday);
```

This schedules three task runs, one in approximately 1 second's time, one
another second after that, and one on a birthday in 2024.

Note that if you schedule a task run with a timestamp in the past, TinyTick will
run it immediately. So if you are reading this guide after April 2024, the
birthday task run will run before the first two!

## Configuring timeouts and retries

As we saw in the Defining Tasks guide, you can configure a task to set things
like a maximum duration and number of retries (or assign it to a category that
does). These can be further overridden when scheduling an individual task run,
using the fourth parameter:

```js
manager.scheduleTaskRun('ping', 'https://fast.org', 0);
manager.scheduleTaskRun('ping', 'https://slow.org', 0, {maxDuration: 5000});
```

Of course it's worth pointing out that these tasks are all now sitting in the
queue to execute as soon as the next 'tick' comes around (every 100ms by
default). To make sure the tasks scheduled above all run, we just need to wait a
little bit and/or stop the Manager.

```js
manager.stop();
// ... wait 2100ms (to be sure the previous scheduled tasks have completed)
```

## Accessing the Manager's task runs

The scheduleTaskRun method returns a newly-created and unique string Id for the
task run. You'll be able to use this to find out its status and information
about it.

```js
const taskRunId = manager.scheduleTaskRun('ping', 'https://example.org');
```

The Manager exposes a list of task runs that are currently scheduled or that are
running. You can access these lists with the getScheduledTaskRunIds method and
the getRunningTaskRuns method respectively:

```js
console.log(manager.getScheduledTaskRunIds().length);
// -> 1
console.log(manager.getRunningTaskRunIds().length);
// -> 0
```

Let's wait for the task run to start. It will move from the scheduled list the
the running list:

```js
manager.start();
// ... wait 100ms (the Manager tickInterval) for task run to start
console.log(manager.getScheduledTaskRunIds().length);
// -> 0
console.log(manager.getRunningTaskRunIds().length);
// -> 1
console.log(manager.getRunningTaskRunIds()[0] == taskRunId);
// -> true
```

And then wait for the task run to finish, after which it will disappear from
both lists:

```js
// ... wait 100ms (another tick) for task run to finish
console.log(manager.getScheduledTaskRunIds().length);
// -> 0
console.log(manager.getRunningTaskRunIds().length);
// -> 0
```

Once the task run is completed, the Manager forgets about it completely.

## Accessing task run properties

There are two ways to access information about a single task run once it is
scheduled or running. One returns the task run's timeout and retry
configuration, and the other its status.

Firstly the getTaskRunConfig method returns the configuration for a task run:

```js
const taskRunId2 = manager.scheduleTaskRun('ping', 'https://example.org');

console.log(manager.getTaskRunConfig(taskRunId2, true));
// -> {maxDuration: 1000, maxRetries: 0, retryDelay: 1000, repeatDelay: null}
```

The `true` argument to getTaskRunConfig ensures you see the inherited and
default values as well as any overrides for the specific task run (of which
there are none in this case)

Secondly, the getTaskRunInfo method returns the status of a task run, including
its Id, any parameter passed to it, whether it's running yet or not, any retries
it's undertaken and so on:

```js
const info = manager.getTaskRunInfo(taskRunId2);
console.log(info.taskId);
// -> 'ping'
console.log(info.arg);
// -> 'https://example.org'
console.log(info.running);
// -> false
```

This returned object is of the TaskRunInfo type. It is useful for checking the
status of a task run, and for debugging.

## Deleting or cancelling a task run

Before it starts running, you can remove a task run from being run in the future
with the delTaskRun method:

```js
console.log(manager.getScheduledTaskRunIds().length);
// -> 1

manager.delTaskRun(taskRunId2);
console.log(manager.getScheduledTaskRunIds().length);
// -> 0
```

If the task is already running, using the delTaskRun method will cause an
attempt to abort it.

## Summary

You now know 90% of what TinyTick is all about. It's time just to run through a
few final features and extra tricks, for which we should proceed to the Advanced
Usage guides.
