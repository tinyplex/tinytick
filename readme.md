<section id="hero"><h2 id="a-tiny-but-very-useful-javascript-task-orchestrator">A tiny but very useful JavaScript task orchestrator.</h2></section><p><a href="https://tinytick.org/guides/releases/#v1-0"><em>NEW!</em> v1.0 release</a></p><p><span id="one-with">&quot;Hello World!&quot;</span></p><p><a class="start" href="https://tinytick.org/guides/getting-started/">Get started</a></p><p><a href="https://tinytick.org/demos/">Try the demos</a></p><p><a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/">Read the docs</a></p><hr><section><h2 id="task-management-is-too-hard"><a href="https://tinytick.org/api/tinytick/type-aliases/task/task/"><code>Task</code></a> management is too hard.</h2><p>Background tasks like fetching, syncing, and cache eviction are common in intelligent web applications. Yet managing them - with scheduling, failure handling, retries, and so on - can be a pain.</p></section><section><h2 id="tinytick-is-here-to-make-it-easy">TinyTick is here to make it easy!</h2><p>Specify your tasks imperatively, ahead of time, and then configure their schedules, timeouts, and retry sequences - and let TinyTick take care of everything for you. Oh and it&#x27;s only <em>1.8kB</em>.</p></section><hr><section><h2 id="create-and-start-a-manager-object">Create and start a <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a> object.</h2><p>This is the main entry point for the TinyTick API.</p></section>

```js
import {createManager} from 'tinytick';
const manager = createManager().start();
```

<section><h2 id="register-a-task">Register a <a href="https://tinytick.org/api/tinytick/type-aliases/task/task/"><code>Task</code></a>.</h2><p>A TinyTick task is simply an asynchronous function that can take an optional string argument (and a few other things, as you&#x27;ll see later!). Simply register it with a string <a href="https://tinytick.org/api/tinytick/type-aliases/identity/id/"><code>Id</code></a>.</p></section>

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

<section><h2 id="configure-timeouts-for-your-tasks">Configure timeouts for your tasks.</h2><p>Tasks (or individual task runs) can have a timeout set, and they will be aborted if they run over. <a href="https://tinytick.org/api/tinytick/type-aliases/task/task/"><code>Task</code></a> functions are passed an <a href="https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal">AbortSignal</a> parameter so you can handle the timeout. You can pass this straight on to the <a href="https://developer.mozilla.org/en-US/docs/Web/API/RequestInit">fetch</a> call, for example.</p></section>

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

<section><h2 id="create-configuration-categories">Create configuration categories.</h2><p>A <a href="https://tinytick.org/api/tinytick/type-aliases/task/task/"><code>Task</code></a> can be assigned a category, which can have its own configuration for duration, retries, and retry delays. But of course, individual properties can still be overridden per task or per task run.</p></section>

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

<section><h2 id="see-some-worked-examples">See some worked examples.</h2><p>We are building up a set of <a href="https://tinytick.org/guides/example-use-cases/">Example Use Cases</a> guides to show you how to use TinyTick in practice. If you&#x27;re trying to access relational- or graph-like data over a network, for example, take a look at the <a href="https://tinytick.org/guides/example-use-cases/paginated-and-nested-data/">Paginated And Nested Data</a> guide for a start!</p></section>

```js yolo
manager.scheduleTaskRun('fetchParents');
// -> 'Fetching https://api.org/parents?page=1'
// -> 'Storing parent A'
// -> 'Storing parent B'
// -> 'Fetching https://api.org/children?parentId=A&page=1'
// -> 'Fetching https://api.org/children?parentId=B&page=1'
// -> 'Fetching https://api.org/parents?page=2'
```

<section><h2 id="tiny-tested-and-documented">Tiny, tested, and documented.</h2><p>If you chose to install TinyTick in your app, you&#x27;ll only add a gzipped <em>1.8kB</em> to your app. Life is easy when you have zero dependencies!</p><p>TinyBase has <em>100.0%</em> test coverage, including the code throughout the documentation - even on this page. The guides, demos, and API examples are designed to make things as easy as possible.</p></section><div class="table"><table class="fixed"><tbody><tr><th width="30%"> </th><th>Total</th><th>Tested</th><th>Coverage</th></tr><tr><th class="right">Lines</th><td>213</td><td>213</td><td>100.0%</td></tr><tr><th class="right">Statements</th><td>244</td><td>244</td><td>100.0%</td></tr><tr><th class="right">Functions</th><td>92</td><td>92</td><td>100.0%</td></tr><tr><th class="right">Branches</th><td>83</td><td>83</td><td>100.0%</td></tr><tr><th class="right">Tests</th><td colspan="3">110</td></tr><tr><th class="right">Assertions</th><td colspan="3">438</td></tr></tbody></table></div><hr><p><a class="start" href="https://tinytick.org/guides/getting-started/">Get started</a></p><p><a href="https://tinytick.org/demos/">Try the demos</a></p><p><a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/">Read the docs</a></p><hr><section id="family"><h2 id="meet-the-family">Meet the family</h2><p>TinyTick is part of a group of small libraries designed to help make rich client and local-first apps easier to build. Check out the others!</p><p><a href="https://tinybase.org" target="_blank"><img src="https://tinybase.org/favicon.svg?asImg" width="48"><br><b>TinyBase</b></a><br>The reactive data store for local-first apps.<br></p><p><a href="https://tinywidgets.org" target="_blank"><img src="https://tinywidgets.org/favicon.svg?asImg" width="48"><br><b>TinyWidgets</b></a><br>A collection of tiny, reusable, UI components.<br></p><p><img src="https://tinytick.org/favicon.svg?asImg" width="48"><br><b>TinyTick</b><br>A tiny but very useful task orchestrator.<br></p></section>