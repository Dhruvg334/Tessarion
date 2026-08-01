# Production end-to-end validation

Use real inboxes you control. Do not use `test.com`, `example.com`, `.test`, or `.example` addresses.

## Test account A

```text
Email: <primary real inbox>
Password: Tessarion@123
Display name: Dhruv Gupta
```

Expected: signup or confirmation completes, `/dashboard` opens, and the authenticated header remains visible on `/about`, `/docs`, and `/demo` after refresh.

## Create the validation notebook

```text
Title: CPU Memory Hierarchy
Description: Production validation for retrieval, graph reasoning, teach-back, tutoring, and review
```

Expected: the creation dialog appears above the blur overlay, the notebook is created once, the modal closes through navigation, and the notebook remains after refresh.

## Source 1

```text
Title: Cache Memory and Locality
```

```text
A computer memory hierarchy balances speed, capacity, and cost. Registers are inside the processor and provide the fastest storage for active values. Cache memory is smaller than main memory but is much faster and physically closer to the processor.

Temporal locality means recently accessed data is likely to be accessed again soon. Spatial locality means nearby data is likely to be accessed soon. A cache hit occurs when requested data is already present in cache. A cache miss requires retrieving data from a slower memory level. Hit rate is the proportion of accesses served by cache, while miss penalty is the extra delay caused by a miss.

Main memory has greater capacity but higher access latency. Virtual memory uses secondary storage as an extension of physical memory. A page fault occurs when a required page is not currently loaded into physical memory.

Cache is not faster because it is larger. It is faster because it uses faster hardware, is closer to the processor, and stores a selected working set of frequently or recently used data.
```

## Source 2

```text
Title: Cache Mapping and Replacement
```

```text
Direct mapping sends each memory block to one cache line. Fully associative mapping allows a block to occupy any cache line. Set-associative mapping sends a block to one set while allowing it to use any line inside that set.

When cache space is required, a replacement policy selects an entry to remove. Least Recently Used attempts to remove the entry that has not been accessed for the longest time. Write-through updates cache and main memory immediately. Write-back delays the main-memory update until a modified block is evicted.
```

Expected after processing:

- the Inngest run completes;
- Qdrant point count increases and payloads include `workspaceId`;
- Neo4j contains concept nodes and relationships for the workspace;
- source status becomes ready without duplicate processing.

## Retrieval checks

Use these queries:

```text
What is temporal locality?
Why is cache faster than main memory?
How can cache mapping and replacement policies affect performance?
```

Expected: answers cite the correct source material, preserve workspace isolation, and do not claim that cache is faster because it is larger.

## Teach-back checks

### Strong response

```text
Temporal locality means recently accessed data is likely to be accessed again soon. Cache benefits by keeping recently used instructions and values close to the processor, allowing repeated accesses to become cache hits instead of slower main-memory accesses.
```

Expected: grounded or understood, with no severe misconception.

### Misconception response

```text
Cache is slower than main memory because cache is smaller. The processor checks main memory first and only checks cache when data is missing from RAM.
```

Expected: misconception detected, source conflict shown, and tutoring selected.

### Improved retry

```text
Cache is smaller than main memory but faster because it uses faster hardware and is physically closer to the processor. Temporal and spatial locality help it retain recently or nearby used data, reducing main-memory latency when a cache hit occurs.
```

Expected: the prior misconception is absent; tutoring completion alone does not directly grant mastery.

## Tutor replies

```text
I thought smaller memory should be slower because it stores less information.
Cache is physically closer to the processor and uses faster hardware.
Locality keeps recently or nearby used data available so the processor may avoid waiting for main memory.
```

Expected: one bounded question at a time, no immediate full answer, then a retry teach-back route.

## Review

Complete the resulting review with:

```text
Cache is faster than main memory because of faster hardware, proximity to the processor, and locality-based storage. Cache size affects capacity, not whether it is inherently faster.
```

Expected: review completes, the queue updates, and the activity log records the action.

## Isolation account B

```text
Email: <second real inbox>
Password: Tessarion@456
Display name: Test Learner
```

Open account A's notebook URL while signed in as account B.

Expected: access denied or workspace not found; no source, concept, activity, tutor, or review data is exposed.

## Operational verification

- **Inngest:** real run reaches Completed without endless retries.
- **Qdrant:** points exist in `tessarion_workspace_chunks_v1`.
- **Neo4j:** no node lacks `workspaceId`; no relationship crosses workspaces.
- **Arize AX:** a `tessarion` tracing project appears automatically and contains safe workflow spans.
- **Security:** traces contain no credentials, passwords, cookies, or raw secret values.

## Release gate

The release is ready only when signup, session persistence, notebook creation, source persistence, processing, retrieval, graph projection, teach-back, tutoring, review, activity, tracing, isolation, logout, and the public demo all pass without console errors or raw provider/database errors in the UI.


## Official product walkthrough

- Video: https://youtu.be/wEGKEA1_CVE
- `/demo` embeds the privacy-enhanced YouTube player.
- `/demo/notebook` remains the public, read-only interactive product experience.
- The video and interactive notebook must both remain accessible without authentication.
