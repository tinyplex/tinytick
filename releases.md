<p>This is a reverse chronological list of the major TinyTick releases, with highlighted features.</p><hr><h1 id="v1-0">v1.0</h1><p>This is the first release! Not much to say, except welcome - and hopefully you get a chance to try TinyTick out and see if it&#x27;s useful for you.</p><p>Want to get started quickly?</p>

```sh
npm install tinytick
```

<p>Here&#x27;s a minimum viable TinyTick application:</p>

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

<p>Then read our <a href="https://tinytick.org/guides/">guides</a> and <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/">API documentation</a> to learn more about what you can do.</p><p>And we&#x27;ve got plans, so stay tuned!</p>