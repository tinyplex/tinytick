# Getting Started

This guide gets you up and running quickly with TinyTick.

It is not intended to be a detailed introduction to installing JavaScript build-
and run-time environments! It assumes that you have (or know how to have) a
browser or Node-based development environment.

Note that TinyTick requires a reasonably modern environment, as it makes use of
contemporary JavaScript features. A regularly-updated browser and Node 16 (or
above) are recommended. If you find you need older compatibility, there are
additional transpilations in the `es6` folder of the distribution.

Let's go!

## Adding TinyTick to a bundled app

Simply install the `tinytick` module with NPM or the package manager of your
choice:

```sh
npm install tinytick
```

Then import it into your application, create a Manager object, and start it:

```js
import {createManager} from 'tinytick';

const manager = createManager();
manager.start();
```

Then you can register a task with the Manager, schedule it to run, and see the
results in the console:

```js
manager.setTask('hello', async (noun) => console.log(`Hello ${noun}!`));

manager.scheduleTaskRun('hello', 'world', 500);
manager.scheduleTaskRun('hello', 'universe', 1000);

// ... wait 550ms to be sure the first task run has been executed
// -> 'Hello world!'

// ... wait 550ms to be sure the second task run has been executed
// -> 'Hello universe!'
```

After half a second you should see the words 'Hello world!' on the screen, and
after another half a second, 'Hello universe!'. Easy, huh?

## TinyTick in a browser

If you prefer things a little more old school, you can include TinyTick as a
minified UMD script from a CDN in a web page. Create a file called `index.html`,
for example:

```html
<html>
  <head>
    <title>My First TinyTick App</title>
    <script src="https://unpkg.com/tinytick/umd/min/index.js"></script>
    <script>
      addEventListener('load', () => {
        const {createManager} = TinyTick;

        const manager = createManager();
        manager.start();

        manager.setTask('hello', async (noun) =>
          document.write(`<p>Hello ${noun}!</p>`),
        );

        manager.scheduleTaskRun('hello', 'world', 500);
        manager.scheduleTaskRun('hello', 'universe', 1000);

        manager.stop();
      });
    </script>
  </head>
  <body />
</html>
```

Open this file in your browser. After half a second you should see the words
'Hello world!' on the screen, and after another half a second, 'Hello
universe!'. Each message was written to the document by a different task run of
the same `hello` task.

Note that the UMD script is pulled from NPM by the [unpkg](https://unpkg.com)
service. This provides a global object from which you can destructure the
top-level functions of the API, much like you would use an `import` or `require`
statement.

## TinyTick in a Node application

And finally, TinyTick can be easily installed as a dependency for a standalone
Node application.

```bash
mkdir MyFirstTinyTickApp
cd MyFirstTinyTickApp
npm init -y
npm install tinytick
```

Create a file in this directory called `index.mjs`:

```js yolo
import {createManager} from 'tinytick';

const manager = createManager();
manager.start();

manager.setTask('hello', async (noun) => console.log(`<p>Hello ${noun}!</p>`));

manager.scheduleTaskRun('hello', 'world', 500);
manager.scheduleTaskRun('hello', 'universe', 1000);

manager.stop();
```

Run this module script with:

```bash
node index.mjs
```

Again, after half a second you should see the words 'Hello world!' on the
screen, and after another half a second, 'Hello universe!'. Each message was
written to the document by a different task run of the same `hello` task.

Note that if the stop method had not been called, the Node process would not
have exited, due to the Manager's tick sequence continuing to run. Think about
this in applications that need to exit cleanly.

## Let's move on!

If that all worked, you are set up and ready to learn more about TinyTick!
Continue with the Key Concepts guide to get familiar with how TinyTick works.
