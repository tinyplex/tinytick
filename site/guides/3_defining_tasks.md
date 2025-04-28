# Defining Tasks

This guide shows you how to define tasks in TinyTick.

## What is a task?

A task is an asynchronous function that you will be scheduling to run at a specific time under the control of TinyTick. You define tasks and assign them
to unique Ids with the setTask method of the Manager object.

By asynchronous, we mean that the task function will return a Promise that
resolves when the task is complete. This allows TinyTick to manage the task's
execution in a non-blocking way, so that other tasks (and your own code) can
seemingly run concurrently.

The easiest way to do this in modern JavaScript is with the `async` keyword.
This snippet, for example, shows us creating a very simple task that fetches
content from a website using the platform's `fetch` function:

```js
const ping = async () => await fetch('https://example.org');
```

The `fetch` function is, in turn, asynchronous, so it needs to be awaited in our
task function.

## Registering a task

We need to register a task with a Manager object before we can schedule it. To
do this, we use its setTask method, as shown in the example below:

```js
import {createManager} from 'tinytick';

const manager = createManager();
manager.start();

manager.setTask('ping', async () => await fetch('https://example.org'));
```

Once this has been done, we can query the Manager to see what tasks it knows
about with the getTaskIds method:

```js
console.log(manager.getTaskIds());
// -> ['ping']
```

And for a given task, we can retrieve timeout and retry configuration:

```js
console.log(manager.getTaskConfig('ping', true));
// -> {maxDuration: 1000, maxRetries: 0, retryDelay: 1000, repeatDelay: null}
```

The `true` argument to getTaskConfig ensures you see the inherited and default
values as well as any overrides for the specific task (of which there are none
in this case)

## Tasks can have a parameter

You can configure a task to accept a single string parameter when it is run.
This is useful when you want to run the same task with different inputs. To do
this, simply add a parameter to the task function:

```js
manager.setTask('ping', async (url) => await fetch(url));
```

This parameter is provided when you schedule the task run. Of course you can
schedule the same task multiple times with different parameters. For example,
this would schedule two task runs, one to fetch `https://tinybase.org` in 100ms'
time, and one to fetch `https://tinytick.org` after that:

```js
manager.scheduleTaskRun('ping', 'https://tinybase.org', 100);
manager.scheduleTaskRun('ping', 'https://tinytick.org', 200);
```

Only one parameter can be provided to a task run. If you need to provide more,
you should provide string-serialized JSON, and parse it in the task function.

## Tasks can be configured

Every task can have its own configuration, which can be set when the task is
registered. The task configuration is a TaskRunConfig object with the following
options:

- `maxDuration` (number): The maximum time in milliseconds that the task is
  allowed to run before it is considered to have failed. The default is 1000ms.
- `maxRetries` (number): The maximum number of times the task will be retried
  if it fails. The default is 0.
- `retryDelay` (number): The time in milliseconds to wait before retrying the
  task. The default is 1000ms.
- `repeatDelay` (number): The time in milliseconds to wait before repeating the
  task if a run was successful. The default is `null`, which means the task will
  not be repeated.

For example, if you wanted a task that would retry three times over 15 seconds
if it failed, or run again after a minute if successful, you would register it
accordingly:

```js
manager.setTask('ping', async (url) => await fetch(url), '', {
  maxRetries: 3,
  retryDelay: 5000,
  repeatDelay: 60000,
});

console.log(manager.getTaskConfig('ping', true));
// -> {maxDuration: 1000, maxRetries: 3, retryDelay: 5000, repeatDelay: 60000}
```

This configuration can be overridden when the task is scheduled to run. In this
case, for example, you might want to have a different timeout for certain
websites.

## Tasks can belong to categories

The third parameter to the setTask method is an optional category name. This
allows you to group tasks together with similar configurations. For example,
you might have a category of tasks called 'network' that all have a common
timeout and retry schedule. Create a category with the setCategory method:

```js
manager.setCategory('network', {
  maxDuration: 2000,
  maxRetries: 5,
  retryDelay: 3000,
});

manager.setTask(
  'post',
  async (url) => await fetch(url, {method: 'POST'}),
  'network',
);
manager.setTask(
  'head',
  async (url) => await fetch(url, {method: 'HEAD'}),
  'network',
);

console.log(manager.getTaskConfig('post', true));
// -> {maxDuration: 2000, maxRetries: 5, retryDelay: 3000, repeatDelay: null}
console.log(manager.getTaskConfig('head', true));
// -> {maxDuration: 2000, maxRetries: 5, retryDelay: 3000, repeatDelay: null}
```

## De-registering a task

In case you need to remove a task from the Manager, you can use the delTask
method:

```js
console.log(manager.getTaskIds());
// -> ['ping', 'post', 'head']

manager.delTask('ping');

console.log(manager.getTaskIds());
// -> ['post', 'head']
```

## Let's move on!

So now that you now know how to register a task, it's time to take a look at how
they can be scheduled. Onwards to the Scheduling Tasks guide!
