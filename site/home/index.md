# TinyTick

<section id="hero">
  <h2>
    An easy way to orchestrate JavaScript tasks.
  </h2>
</section>

<a href='/guides/releases/#v1-0'><em>NEW!</em> v1.0 release</a>

<span id="one-with">"The Very First One!"</span>

<a class='start' href='/guides/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/'>Read the docs</a>

---

> Firstly, create the manager, define tasks as functions and register them
> programmatically.

```js
import {createManager} from 'tinytick';

const manager = createManager();
manager.setTask('ping', () =>
  fetch('https://example.com'),
);

console.log(manager.getTaskIds());
// -> ['ping']
```

> Tasks can be configured - with information about how often to retry them or
> how to time them out, for example.

```js
manager.setTaskConfig('ping', {maxDuration: 2});

console.log(manager.getTaskConfig('ping'));
// -> {maxDuration: 2}
```

> Tasks can be categorized, which allows you to create your own defaults for how
> they behave.

```js
manager.setCategoryConfig('network', {maxRetries: 10});
manager.setTaskConfig('ping', {categoryId: 'network'});

console.log(manager.getTaskConfig('ping'));
// -> {categoryId: 'network'}
```

> And then of course, when you're ready, schedule the task to run! This can be
> for an immediate run, once in the future, or repetitively.

```js
//const runId = manager.scheduleRun('test');

//console.log(manager.getRunStatus(runId));
//// -> {}
```

---

<a class='start' href='/guides/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/'>Read the docs</a>
