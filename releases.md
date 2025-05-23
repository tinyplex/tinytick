<p>This is a reverse chronological list of the major TinyTick releases, with highlighted features.</p><hr><h1 id="v1-2">v1.2</h1><p>This is a major release that includes reactivity and an optional module of React bindings.</p><h2 id="manager-listeners"><a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a> listeners</h2><p>There is now a set of new <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a> methods that can add listeners for various events. These include:</p><ul><li>The <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/methods/listener/addstatuslistener/"><code>addStatusListener</code></a> method to listen to the <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a>&#x27;s overall status.</li><li>The <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/methods/listener/addwillticklistener/"><code>addWillTickListener</code></a> method and <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/methods/listener/adddidticklistener/"><code>addDidTickListener</code></a> methods to listen to the start and end of each tick.</li><li>The <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/methods/listener/addscheduledtaskrunidslistener/"><code>addScheduledTaskRunIdsListener</code></a> method and addRunningTaskRunIdsListener method to listen to the lists of scheduled and running task run <a href="https://tinytick.org/api/tinytick/type-aliases/identity/ids/"><code>Ids</code></a>, respectively.</li><li>The <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/methods/listener/addtaskrunrunninglistener/"><code>addTaskRunRunningListener</code></a> method to listen to the start and end of each task run.</li><li>The <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/methods/listener/addtaskrunfailedlistener/"><code>addTaskRunFailedListener</code></a> method to listen to the failure of task runs.</li></ul><p>In all cases, the <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/methods/listener/dellistener/"><code>delListener</code></a> method should be used to unregister the listener when it is no longer needed.</p><h2 id="react-bindings">React bindings</h2><p>Building on the basic bindings in the previous release, this release adds a set of hooks to benefit from the <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a>&#x27;s reactivity. These include:</p><ul><li>The <a href="https://tinytick.org/api/ui-react/functions/manager-hooks/usestatus/"><code>useStatus</code></a> hook to get the <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a>&#x27;s status.</li><li>The <a href="https://tinytick.org/api/ui-react/functions/task-run-hooks/usescheduledtaskrunids/"><code>useScheduledTaskRunIds</code></a> hook and <a href="https://tinytick.org/api/ui-react/functions/task-run-hooks/userunningtaskrunids/"><code>useRunningTaskRunIds</code></a> hook to get the lists of scheduled and running task run <a href="https://tinytick.org/api/tinytick/type-aliases/identity/ids/"><code>Ids</code></a>, respectively.</li><li>The <a href="https://tinytick.org/api/ui-react/functions/task-run-hooks/usetaskrunrunning/"><code>useTaskRunRunning</code></a> hook to get changes to the the task run&#x27;s status.</li><li>The <a href="https://tinytick.org/api/ui-react/functions/manager-hooks/usestartcallback/"><code>useStartCallback</code></a> hook and useStopCallback to get callbacks that can start and stop the <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a>.</li><li>The <a href="https://tinytick.org/api/ui-react/functions/task-hooks/usesettask/"><code>useSetTask</code></a> hook to register a task in the <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a>.</li><li>The <a href="https://tinytick.org/api/ui-react/functions/task-run-hooks/usescheduletaskrun/"><code>useScheduleTaskRun</code></a> hook to schedule a task run in the <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a>, and the <a href="https://tinytick.org/api/ui-react/functions/task-run-hooks/usescheduletaskruncallback/"><code>useScheduleTaskRunCallback</code></a> hook to get a callback that can be used to do so later.</li></ul><p>In all cases, these hooks operate on the <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a> registered in the <a href="https://tinytick.org/api/ui-react/functions/context-components/provider/"><code>Provider</code></a> component so that one <a href="https://tinytick.org/api/tinytick/interfaces/manager/manager/"><code>Manager</code></a> can be used consistently throughout the application, something like this:</p>

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

<p>More information and examples for these React features is in the <a href="https://tinytick.org/api/ui-react/"><code>ui-react</code></a> module API documentation.</p><p>Have fun and let us know how it goes!</p><h1 id="v1-1">v1.1</h1><p>This release contains a very simple React integration. It&#x27;s in the <a href="https://tinytick.org/api/ui-react/"><code>ui-react</code></a> module and literally just adds a hook around the <a href="https://tinytick.org/api/tinytick/functions/creation/createmanager/"><code>createManager</code></a> function and a context component. Stay tuned for more interesting features in the future!</p><h1 id="v1-0">v1.0</h1><p>This is the first release! Not much to say, except welcome - and hopefully you get a chance to try TinyTick out and see if it&#x27;s useful for you.</p><p>Want to get started quickly?</p>

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