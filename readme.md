<section id="hero"><h2 id="an-easy-way-to-orchestrate-javascript-tasks">An easy way to orchestrate JavaScript tasks.</h2></section><p><a href="https://tinytick.org/guides/releases/#v1-0"><em>NEW!</em> v1.0 release</a></p><p><span id="one-with">&quot;The Very First One!&quot;</span></p><p><a class="start" href="https://tinytick.org/guides/getting-started/">Get started</a></p><p><a href="https://tinytick.org/demos/">Try the demos</a></p><p><a href="https://tinytick.org/api/">Read the docs</a></p><hr><section><p>Firstly, create the manager, define tasks as functions and register them programmatically.</p></section>

```js
import {createManager} from 'tinytick';

const manager = createManager();
manager.setTask('ping', () =>
  fetch('https://example.com'),
);

console.log(manager.getTaskIds());
// -> ['ping']
```

<section><p>Tasks can be configured - with information about how often to retry them or how to time them out, for example.</p></section>

```js
manager.setTaskConfig('ping', {maxDuration: 2});

console.log(manager.getTaskConfig('ping'));
// -> {maxDuration: 2}
```

<section><p>Tasks can be categorized, which allows you to create your own defaults for how they behave.</p></section>

```js
manager.setCategoryConfig('network', {maxRetries: 10});
manager.setTaskConfig('ping', {categoryId: 'network'});

console.log(manager.getTaskConfig('ping'));
// -> {categoryId: 'network'}
```

<section><p>And then of course, when you&#x27;re ready, schedule the task to run! This can be for an immediate run, once in the future, or repetitively.</p></section>

```js
//const runId = manager.scheduleRun('test');

//console.log(manager.getRunStatus(runId));
//// -> {}
```

<hr><p><a class="start" href="https://tinytick.org/guides/getting-started/">Get started</a></p><p><a href="https://tinytick.org/demos/">Try the demos</a></p><p><a href="https://tinytick.org/api/">Read the docs</a></p>