# Releases

This is a reverse chronological list of the major TinyTick releases, with
highlighted features.

---

# v1.2

This is a major release that includes reactivity and an optional module of React
bindings.

## Manager listeners

There is now a set of new Manager methods that can add listeners for various
events. These include:

- The addStatusListener method to listen to the Manager's overall status.
- The addWillTickListener method and addDidTickListener methods to listen to the
  start and end of each tick.
- The addScheduledTaskRunIdsListener method and addRunningTaskRunIdsListener
  method to listen to the lists of scheduled and running task run Ids,
  respectively.
- The addTaskRunRunningListener method to listen to the start and end of each
  task run.
- The addTaskRunFailedListener method to listen to the failure of task runs.

In all cases, the delListener method should be used to unregister the listener
when it is no longer needed.

## React bindings

Building on the basic bindings in the previous release, this release adds a set
of hooks to benefit from the Manager's reactivity. These include:

- The useStatus hook to get the Manager's status.
- The useScheduledTaskRunIds hook and useRunningTaskRunIds hook to get the lists
  of scheduled and running task run Ids, respectively.
- The useTaskRunRunning hook to get changes to the the task run's status.
- The useStartCallback hook and useStopCallback to get callbacks that can start
  and stop the Manager.
- The useSetTask hook to register a task in the Manager.
- The useScheduleTaskRun hook to schedule a task run in the Manager.

In all cases, these hooks operate on the Manager registered in the Provider
component so that one Manager can be used consistently throughout the
application, something like this:

```tsx yolo
import {
  Provider,
  useCreateManager,
  useScheduleTaskRunCallback,
  useSetTask,
} from 'tinytick/ui-react';

const App = () => (
  <Provider manager={useCreateManager(createManager)}>
    <Panel />
  </Provider>
);

const Panel = () => {
  useSetTask('ping', async () => await fetch('https://example.org'));
  return <Button />;
};

const Button = () => {
  const callback = useScheduleTaskRunCallback('ping');
  return <button onClick={callback}>Ping</button>;
};
```

More information and examples for these React features is in the ui-react module
API documentation.

Have fun and let us know how it goes!

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
