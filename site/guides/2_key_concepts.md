# Key Concepts

This guide runs through some of the key concepts you need to understand to use
TinyTick effectively.

## Manager

The Manager object is the core of TinyTick. It is responsible for managing the
registry of tasks used in your app, and the schedule for starting them. It is
your main entry point into the TinyTick API. Create it with the createManager
function.

## Tasks

A Task is an asynchronous function that you will be scheduling to run at a
specific time under the control of TinyTick. You define tasks and assign them to
unique Ids with the setTask method of the Manager object.

## TaskRuns

A task run is a single scheduled execution of a task that will be executed by
TinyTick when its time arrives. You schedule a task to run with the
scheduleTaskRun method. Each task run is also given a unique Id by TinyTick.

## Configuration

Options are used to control either the behavior of the Manager (via the
setManagerConfig method), or the behavior of task runs. For task runs,
configuration can be provided for a specific task run (via the scheduleTaskRun
method), all runs of a task (via the setTask method), or for all runs of tasks
in a category (via the setCategory method).

## Categories

A category is an optional way to group tasks together with similar
configurations. For example, you might have a category of tasks called 'network'
that all have a common timeout and retry schedule. Create a category with the
setCategory method.

## Ticks

A 'tick' is a single iteration of the Manager's main loop - the heartbeat of
TinyTick, if you like, wherein scheduled task runs are checked to be started, or
running tasks runs to be timed out and aborted. The Manager's tickInterval
property controls the frequency (by default there is 100ms between each tick): a
lower value means more accuracy around when tasks run, but at the expense of
overall performance

With those key phrases in mind, it's time to dive in. Continue with the Defining
Tasks guide to see how to put these concepts to use.
