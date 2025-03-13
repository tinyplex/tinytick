# Paginated And Nested Data

Imagine you are fetching information about multiple 'parent' items from a
network endpoint, but the items you want are paginated. Also imagine that each
item requires subsequent separate network requests to access 'child' data about
it - which might also be paginated.

A real example of this might be fetching data about GitHub repositories, and for
each repository, fetching the issues and pull requests associated with it. But
of course many similar examples exist in applications that have relational- or
graph-like data models.

Your choices (other than to build a GraphQL backend!) are traditionally to go
either:

## Breadth-first

Fetch and paginate through every parent item (A, B, C...) until you have them
all, and then go back and fetch and paginate through every child item (a1, a2,
a3, a4, b2, ...) for each parent item.

The fetch sequence for data would look like this:

```plaintext
Parent page 1:
  A
  B
Parent page 2:
  C
  D
A children page 1:
  a1
  a2
A children page 2:
  a3
  a4
B children page 1:
  b1
  b2
...
```

The downside of this is that you have no child data about the first parent item
until you have fetched _all_ the parent items.

## OR Depth-first

Fetch each parent item, and then fetch and paginate through all the child data
for that item before moving on to the next parent item.

The fetch sequence for data would look like this:

```plaintext
Parent page 1:
  A
  B
A children page 1:
  a1
  a2
A children page 2:
  a3
  a4
B children page 1:
  b1
  b2
Parent page 2:
  C
  D
...
```

The downside of _this_ approach means you quickly have all the child data for
the first item but you can't see that later parent items even exist until the
whole process is nearly complete.

And in either case, if a single fetch fails, or is slow, the whole sequence is
held up until it completes.

## BUT With TinyTick...

Instead, TinyTick can help you to fetch all the data with sort of a 'queue'
approach, which ends up being a hybrid of the two loop-based approaches. Every
time a fetch task completes, it schedules the next tasks to run - such as the
next page of parent items, or the first page of child data for the parent item
just fetched. That first page of child data can then schedule the next page of
child data itself if needed.

Depending on how long each fetch takes, the sequence of fetches that the
application is making is then a mix of parent and child data:

```plaintext
Parent page 1:
  A
  B
  -> schedule 'A children page 1', 'B children page 1', 'Parent page 2'
A children page 1:
  a1
  a2
  -> schedule 'A children page 2'
B children page 1:
  b1
  b2
Parent page 2:
  C
  D
  -> schedule 'C children page 1', 'D children page 1'
A children page 2:
  a3
  a4
...
```

This interleaving minimizes the disadvantages of breadth-first and depth-first
approaches, since you start to see the child detail for early parent items
quickly, but you also see the full set of parent items appear early too.

This is also more tolerant to a single fetch failing or being slow, since the
other parts of the sequence have been scheduled and can continue in the
meantime.

## A possible implementation

Here is a very simplified example of how you might implement this with TinyTick
against an idealized data source.

First initialize TinyTick:

```js
import {createManager} from 'tinytick';

const manager = createManager();
manager.start();
```

Let's register a task function to fetch a page of parent data. It will schedule
the next page of parent data and the first page of child data for each parent
item:

```js
manager.setTask(
  'fetchParents',
  async (arg = '[1]') => {
    const [page] = JSON.parse(arg);

    const url = `https://api.org/parents?page=${page}`;
    console.log(`Fetching ${url}`);

    const data = await (await fetch(url)).json();

    data.parents.forEach((parent) => {
      // 1. Store parent data in memory or local storage (not shown)
      console.log(`Storing parent ${parent.id}`);

      // 2. Schedule the first page of child data for this parent
      const parentIdAndPage = JSON.stringify([parent.id, 1]);
      manager.scheduleTaskRun('fetchChildren', parentIdAndPage);
    });

    if (data.hasMore) {
      // 3. Schedule the next page of parent data
      manager.scheduleTaskRun('fetchParents', JSON.stringify([page + 1]));
    }
  },
  'network',
);
```

Next, let's create a task to fetch child data. It will also schedule the next
page of child data if there is one:

```js
manager.setTask(
  'fetchChildren',
  async (arg) => {
    const [parentId, page] = JSON.parse(arg);

    const url = `https://api.org/children?parentId=${parentId}&page=${page}`;
    console.log(`Fetching ${url}`);

    const data = await (await fetch(url)).json();

    data.children.forEach((child) => {
      // 1. Store child data in memory or local storage (not shown)
      console.log(`Storing child ${child.id}`);
    });

    if (data.hasMore) {
      // 2. Schedule the next page of children data
      const parentIdAndPage = JSON.stringify([parentId, page + 1]);
      manager.scheduleTaskRun('fetchChildren', parentIdAndPage);
    }
  },
  'network',
);
```

Notice that tasks can only take one (string) parameter, so we are serializing
the parent ID and the page number into a single string for the `fetchChildren`
task (and for consistency also doing the same for the argument of the
`fetchParents` task).

Notice also how we've categorized both tasks as 'network'. We could use that to
set common retry and timeout settings for both tasks in case we wanted to be
tolerant to network failures:

```js
manager.setCategory('network', {maxRetries: 3, retryDelay: 1000});
```

Finally, schedule the first page of parent data to start the sequence. (In the
output below, we assume that the network fetches are always successful and
respond with the same latency).

```js
manager.scheduleTaskRun('fetchParents');
// ... wait 500ms for the sequence to start and complete
// -> 'Fetching https://api.org/parents?page=1'
// -> 'Storing parent A'
// -> 'Storing parent B'
// -> 'Fetching https://api.org/children?parentId=A&page=1'
// -> 'Fetching https://api.org/children?parentId=B&page=1'
// -> 'Fetching https://api.org/parents?page=2'
// -> 'Storing child a1'
// -> 'Storing child a2'
// -> 'Storing child b1'
// -> 'Storing child b2'
// -> 'Storing parent C'
// -> 'Storing parent D'
// -> 'Fetching https://api.org/children?parentId=A&page=2'
// -> 'Fetching https://api.org/children?parentId=C&page=1'
// -> 'Fetching https://api.org/children?parentId=D&page=1'
// -> 'Storing child a3'
// -> 'Storing child a4'
// -> 'Storing child c1'
// -> 'Storing child c2'
// -> 'Storing child d1'
// -> 'Storing child d2'
// ...
```

Boom.

The main thing to identify here is how we are interleaving the parent and child
data fetches, giving us a blend of the breadth-first and depth-first approaches.

But without even trying, we are also getting a nice balanced parallelism for the
number of concurrent fetches. And also remember that each of these fetches is
fault-tolerant! If one fails, it can be put back on the schedule queue to try
again.

Also, think about how things might change if you delay the start of certain
tasks. For example, if you scheduled children fetches to run a few milliseconds
in the future (rather than immediately, as above), you could spread the load
over the two endpoints and tune the 'prioritization' of parent data fetches over
child data fetches.

The right balance of scheduling heuristics will be specific to your app and what
data is important to the user as a function of immediacy. The same goes for
retry and timeout settings - you might want different configurations for more vs
less critical fetches in your app, for example.

But hopefully you get the idea!

## Summary

This guide has provided a view of how TinyTask can be used to build more complex
fetch sequences in your application.

A final note... one thing that's out of scope here is a discussion of how to
store the data effectively. But for that you might take a look at our sister
project [TinyBase](https://tinybase.org/). Enjoy!
