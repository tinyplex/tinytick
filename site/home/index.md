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
const ping = () => fetch('https://example.com');
manager.setTask('ping', ping);

console.log(manager.getTaskIds());
// -> ['ping']
```

> Tasks can be categorized, with information about how often to retry them or
> how to time them out, for example.

```js
manager.setCategory('network', {maxRetries: 10});
manager.setTask('ping', ping, 'network');

console.log(manager.getTaskConfig('ping', true));
// -> {maxDuration: 1000, maxRetries: 10, retryDelay: 3000}
```

> Tasks can be configured on a case-by-case basis too:

```js
manager.setTask('ping', ping, undefined, {
  maxDuration: 2000,
});
console.log(manager.getTaskConfig('ping'));
// -> {maxDuration: 2000}
```

> And then of course, when you're ready, schedule the task to run! This can be
> for an immediate run, once in the future, or repetitively.

```js
const testRunId = manager.setTaskRun('test');
```

---

<a class='start' href='/guides/getting-started/'>Get started</a>

<a href='/demos/'>Try the demos</a>

<a href='/api/'>Read the docs</a>
