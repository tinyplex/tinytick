# Releases

This is a reverse chronological list of the major TinyTick releases, with
highlighted features.

---

# v1.1

This release contains a very simple React integration. It's in the ui-react
module and literally just adds a hook around the createManager function and a
context component. Stay tuned for more interesting features in the future!

# v1.0

This is the first release! Not much to say, except welcome - and hopefully you
get a chance to try TinyTick out and see if it's useful for you.

Want to get started quickly?

```sh
npm install tinytick
```

Here's a minimum viable TinyTick application:

```js
import {createManager} from 'tinytick';

const manager = createManager();
manager.setTask('hello', async (noun) => console.log(`Hello ${noun}!`));

manager.scheduleTaskRun('hello', 'world', 500);
manager.scheduleTaskRun('hello', 'universe', 1000);

manager.start();
// ... wait 550ms to be sure the first task run has been executed
// -> 'Hello world!'

// ... wait 550ms to be sure the second task run has been executed
// -> 'Hello universe!'
```

Then read our [guides](/guides/) and [API
documentation](/api/tinytick/interfaces/manager/manager/) to learn more about
what you can do.

And we've got plans, so stay tuned!
