# TinyTick

<section id="hero">
  <h2>
    A tiny but very useful JavaScript task orchestrator.
  </h2>
</section>

<a href='/guides/releases/#v1-2'><em>NEW!</em> v1.2 release</a>

<span id="one-with">The one with reactivity - and React!</span>

<a class='start' href='/guides/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/tinytick/interfaces/manager/manager/'>Read the docs</a>

---

> ## Task management is hard.
>
> Background tasks like fetching, syncing, and cache eviction are common in
> intelligent web applications. Yet managing them - with scheduling, failure
> handling, retries, and so on - can be a pain.

> ## So make it easy.
>
> Specify your tasks imperatively, ahead of time, and then configure their
> schedules, timeouts, and retry sequences - and let TinyTick take care of
> everything for you. Oh and it's only
> _@@EVAL("toKb(modulesSizes.get('').get('gz'))")_.

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

> ## TinyTick is reactive.
>
> Subscribe to listeners that fire whenever critical things happen, like when a
> task starts, finishes, or fails. It uses the same API as TinyBase, so if you
> are familiar with listeners in that library, you'll feel right at home!

```js
const listenerId1 = manager.addTaskRunRunningListener(
  'ping',
  null,
  () => console.log('A ping started'),
);
const listenerId2 = manager.addTaskRunFailedListener(
  'ping',
  null,
  () => console.log('A ping failed'),
);
// ...
manager.delListener(listenerId1);
manager.delListener(listenerId2);
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

> ## Integrates with React.
>
> The optional Provider component and a set of hooks in the ui-react module make
> it easy to integrate TinyTick into your React application so that you can
> start tasks or visualize their progress.

```js yolo
import React from 'react';
import {createRoot} from 'react-dom/client';
import {useCreateManager, useScheduleTaskRunCallback} from 'tinytick/ui-react';

const App = () =>
  <Provider manager={useCreateManager(createManager)}>
    <Panel />
  </Provider>
};

const Panel = () => {
  useSetTask('ping', async () => await fetch('https://example.org'));
  return <Button />;
};

const Button = () => {
  const callback = useScheduleTaskRunCallback('ping');
  return <button onClick={callback}>Ping</button>;
};
```

> ## See some worked examples.
>
> We are building up a set of Example Use Cases guides to show you how to use
> TinyTick in practice. If you're trying to access relational- or graph-like
> data over a network, for example, take a look at the Paginated And Nested Data
> guide for a start!

```js yolo
manager.scheduleTaskRun('fetchParents');
// -> 'Fetching https://api.org/parents?page=1'
// -> 'Storing parent A'
// -> 'Storing parent B'
// -> 'Fetching https://api.org/children?parentId=A&page=1'
// -> 'Fetching https://api.org/children?parentId=B&page=1'
// -> 'Fetching https://api.org/parents?page=2'
```

> ## Tiny, tested, and documented.
>
> If you chose to install TinyTick in your app, you'll only add a gzipped
> _@@EVAL("toKb(modulesSizes.get('').get('gz'))")_ to your app. Life is
> easy when you have zero dependencies!
>
> TinyBase has _@@EVAL("coverage.lines.pct.toFixed(1)")%_ test coverage,
> including the code throughout the documentation - even on this page. The
> guides, demos, and API examples are designed to make things as easy as
> possible.

@@EVAL("getCoverageTable()")

---

<a class='start' href='/guides/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/tinytick/interfaces/manager/manager/'>Read the docs</a>

---

<section id="family">
  <h2>Meet the family</h2>
  <p>TinyTick is part of a group of small libraries designed to help make rich client and local-first apps easier to build. Check out the others!</p>

  <p>
    <a href='https://tinybase.org' target='_blank'>
      <img width="48" src="https://tinybase.org/favicon.svg?asImg" />
      <br/>
      <b>TinyBase</b>
    </a>
    <br />A reactive data store and sync engine.
  </p>

  <p>
    <a href='https://tinywidgets.org' target='_blank'>
      <img width="48" src="https://tinywidgets.org/favicon.svg?asImg" />
      <br/>
      <b>TinyWidgets</b>
    </a>
    <br />A collection of tiny, reusable, UI components.
  </p>

  <p>
    <img width="48" src="https://tinytick.org/favicon.svg?asImg" />
    <br />
    <b>TinyTick</b>
    <br />A tiny but very useful task orchestrator.
  </p>
</section>
