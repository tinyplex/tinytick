# Scheduling

In this demo, we show how to configure and schedule a task.

First, since we're running this in a browser, we register some import aliases
for `esm.sh`:

```html
<script type="importmap">
  {
    "imports": {
      "tinytick": "https://esm.sh/tinytick@"
    }
  }
</script>
```

We import the createManager function, create the Manager object, and start it:

```js
import {createManager} from 'tinytick';

const manager = createManager().start();
```

We create a task with the setTask method. We give it a task Id of `hello`:

```js
manager.setTask(
  'hello',
  async (noun) => (document.body.innerHTML = `Hello ${noun}!`),
);
```

Then we schedule three task runs with the scheduleTaskRun method. One to go more
or less immediately, and then two to go
after short delays:

```js
manager.scheduleTaskRun('hello', 'world');
manager.scheduleTaskRun('hello', 'universe', 1000);
manager.scheduleTaskRun('hello', 'multiverse', 2000);
```

Add a little styling, and we're done!

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

body {
  align-items: center;
  display: flex;
  font-family: Inter, sans-serif;
  letter-spacing: -0.04rem;
  height: 100vh;
  justify-content: center;
  margin: 0;
}
```

And we're done! You now know the basics of creating a task and scheduling it.
