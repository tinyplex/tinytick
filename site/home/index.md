# TinyTick

<section id="hero">
  <h2>
    A tiny but very useful JavaScript task orchestrator.
  </h2>
</section>

<a href='/guides/releases/#v1-0'><em>NEW!</em> v1.0 release</a>

<span id="one-with">"The Very First One!"</span>

<a class='start' href='/guides/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/'>Read the docs</a>

---

> ## Task management is too hard
>
> Background tasks like fetching, syncing, and cache eviction are common in
> intelligent web applications. Yet managing them - with scheduling, failure
> handling, retries, and so on - can be a pain.

> ## TinyTick is here to make it easy!
>
> Specify your tasks imperatively (or declaratively into a React context),
> configure their schedules, timeouts, and retry sequences - and let TinyTick
> take care of everything for you.

---

> ## Create and start a Manager object.
>
> This is the main entry point for the TinyTick API.

```js
import {createManager} from 'tinytick';
const manager = createManager().start();
```

> ## Register a Task.
>
> A TinyTick task is simply an asynchronous function that can take an optional
> string argument (and a few other things, as you'll see later!). Simply
> register it with a string Id.

```js
const ping = async (url) => await fetch(url);
manager.setTask('ping', ping);
```

> ## Schedule it to run.
>
> By default, TinyTask schedules the task to start as soon as possible. And it
> will generate a unique Id for each 'task run' so you can track its progress.

```js
const taskRunId = manager.scheduleTaskRun(
  'ping',
  'https://example.com',
);
```

> ## Keep up with what is going on.
>
> The Manager object exposes plenty of accessors to let you inspect the tasks
> you have registered and the state of the task runs you've scheduled.

```js yolo
console.log(manager.getTaskIds());
// -> ['ping']
console.log(manager.getTaskRunInfo(taskRunId));
// -> {taskId: 'ping', arg: 'https://example.com', ...}
```

> ## Configure timeouts for your tasks.
>
> Tasks (or individual task runs) can have a timeout set, and they will be
> aborted if they run over. Task functions are passed an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) parameter so
> you can handle the timeout. You can pass this straight on to the [fetch](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) call, for
> example.

```js
manager.setTask(
  'ping',
  async (url, signal) => await fetch(url, {signal}),
  undefined,
  {maxDuration: 100}, // milliseconds
);
```

> ## Orchestrate retries.
>
> If a task run fails (for taking too long, or throwing an exception), you can
> indicate that you want it to retry, and even configure a backoff strategy.

```js
manager.setTask(
  'ping',
  async (url, signal) => await fetch(url, {signal}),
  undefined, // we'll explain this argument in a moment!
  {maxRetries: 3, retryDelay: '1000, 5000, 10000'},
);
```

> ## Create configuration categories.
>
> A Task can be assigned a category, which can have its own configuration for
> duration, retries, and retry delays. But of course, individual properties can
> still be overridden per task or per task run.

```js
manager.setCategory('network', {
  maxDuration: 100,
  maxRetries: 3,
  retryDelay: '1000, 5000, 10000',
});
manager.setTask('ping', ping, 'network', {
  maxRetries: 5,
});
```

---

<a class='start' href='/guides/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/'>Read the docs</a>
