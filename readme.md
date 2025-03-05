<section id="hero"><h2 id="a-tiny-but-very-useful-javascript-task-orchestrator">A tiny but very useful JavaScript task orchestrator.</h2></section><p><a href="https://tinytick.org/guides/releases/#v1-0"><em>NEW!</em> v1.0 release</a></p><p><span id="one-with">&quot;The Very First One!&quot;</span></p><p><a class="start" href="https://tinytick.org/guides/getting-started/">Get started</a></p><p><a href="https://tinytick.org/demos/">Try the demos</a></p><p><a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/">Read the docs</a></p><hr><section><h2 id="task-management-is-too-hard"><a href="https://tinytick.org/api/tinytick/type-aliases/identity/task/"><code>Task</code></a> management is too hard.</h2><p>Background tasks like fetching, syncing, and cache eviction are common in intelligent web applications. Yet managing them - with scheduling, failure handling, retries, and so on - can be a pain.</p></section><section><h2 id="tinytick-is-here-to-make-it-easy">TinyTick is here to make it easy!</h2><p>Specify your tasks imperatively, ahead of time, and then configure their schedules, timeouts, and retry sequences - and let TinyTick take care of everything for you.</p></section><hr><section><h2 id="create-and-start-a-manager-object">Create and start a <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a> object.</h2><p>This is the main entry point for the TinyTick API.</p></section>

```js
import {createManager} from 'tinytick';
const manager = createManager().start();
```

<section><h2 id="register-a-task">Register a <a href="https://tinytick.org/api/tinytick/type-aliases/identity/task/"><code>Task</code></a>.</h2><p>A TinyTick task is simply an asynchronous function that can take an optional string argument (and a few other things, as you&#x27;ll see later!). Simply register it with a string <a href="https://tinytick.org/api/tinytick/type-aliases/identity/id/"><code>Id</code></a>.</p></section>

```js
const ping = async (url) => await fetch(url);
manager.setTask('ping', ping);
```

<section><h2 id="schedule-it-to-run">Schedule it to run.</h2><p>By default, TinyTask schedules the task to start as soon as possible. And it will generate a unique <a href="https://tinytick.org/api/tinytick/type-aliases/identity/id/"><code>Id</code></a> for each &#x27;task run&#x27; so you can track its progress.</p></section>

```js
const taskRunId = manager.scheduleTaskRun(
  'ping',
  'https://example.com',
);
```

<section><h2 id="keep-up-with-what-is-going-on">Keep up with what is going on.</h2><p>The <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a> object exposes plenty of accessors to let you inspect the tasks you have registered and the state of the task runs you&#x27;ve scheduled.</p></section>

```js yolo
console.log(manager.getTaskIds());
// -> ['ping']
console.log(manager.getTaskRunInfo(taskRunId));
// -> {taskId: 'ping', arg: 'https://example.com', ...}
```

<section><h2 id="configure-timeouts-for-your-tasks">Configure timeouts for your tasks.</h2><p>Tasks (or individual task runs) can have a timeout set, and they will be aborted if they run over. <a href="https://tinytick.org/api/tinytick/type-aliases/identity/task/"><code>Task</code></a> functions are passed an <a href="https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal">AbortSignal</a> parameter so you can handle the timeout. You can pass this straight on to the <a href="https://developer.mozilla.org/en-US/docs/Web/API/RequestInit">fetch</a> call, for example.</p></section>

```js
manager.setTask(
  'ping',
  async (url, signal) => await fetch(url, {signal}),
  undefined,
  {maxDuration: 100}, // milliseconds
);
```

<section><h2 id="orchestrate-retries">Orchestrate retries.</h2><p>If a task run fails (for taking too long, or throwing an exception), you can indicate that you want it to retry, and even configure a backoff strategy.</p></section>

```js
manager.setTask(
  'ping',
  async (url, signal) => await fetch(url, {signal}),
  undefined, // we'll explain this argument in a moment!
  {maxRetries: 3, retryDelay: '1000, 5000, 10000'},
);
```

<section><h2 id="create-configuration-categories">Create configuration categories.</h2><p>A <a href="https://tinytick.org/api/tinytick/type-aliases/identity/task/"><code>Task</code></a> can be assigned a category, which can have its own configuration for duration, retries, and retry delays. But of course, individual properties can still be overridden per task or per task run.</p></section>

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

<hr><p><a class="start" href="https://tinytick.org/guides/getting-started/">Get started</a></p><p><a href="https://tinytick.org/demos/">Try the demos</a></p><p><a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/">Read the docs</a></p>