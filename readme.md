<section id="hero"><h2 id="an-easy-way-to-orchestrate-javascript-tasks">An easy way to orchestrate JavaScript tasks.</h2></section><p><a href="https://tinytick.org/guides/releases/#v1-0"><em>NEW!</em> v1.0 release</a></p><p><span id="one-with">&quot;The Very First One!&quot;</span></p><p><a class="start" href="https://tinytick.org/guides/getting-started/">Get started</a></p><p><a href="https://tinytick.org/demos/">Try the demos</a></p><p><a href="https://tinytick.org/api/">Read the docs</a></p><hr><section><p>Firstly, create the manager, define tasks as functions and register them programmatically.</p></section>

```js
import {createManager} from 'tinytick';

const manager = createManager();
const ping = () => fetch('https://example.com');
manager.setTask('ping', ping);

console.log(manager.getTaskIds());
// -> ['ping']
```

<section><p>Tasks can be categorized, with information about how often to retry them or how to time them out, for example.</p></section>

```js
manager.setCategory('network', {maxRetries: 10});
manager.setTask('ping', ping, 'network');

console.log(manager.getTaskConfig('ping', true));
// -> {maxDuration: 1000, maxRetries: 10, retryDelay: 3000}
```

<section><p>Tasks can be configured on a case-by-case basis too:</p></section>

```js
manager.setTask('ping', ping, undefined, {
  maxDuration: 2000,
});
console.log(manager.getTaskConfig('ping'));
// -> {maxDuration: 2000}
```

<section><p>And then of course, when you&#x27;re ready, schedule the task to run! This can be for an immediate run, once in the future, or repetitively.</p></section>

```js
const testRunId = manager.scheduleTaskRun('test');
```

<hr><p><a class="start" href="https://tinytick.org/guides/getting-started/">Get started</a></p><p><a href="https://tinytick.org/demos/">Try the demos</a></p><p><a href="https://tinytick.org/api/">Read the docs</a></p>