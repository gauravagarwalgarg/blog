---
title: 'Distributed Systems: What I Wish I Knew Earlier'
description: 'Key concepts every engineer should internalize before building distributed systems CAP theorem, consensus protocols, failure modes, and the mental models that actually matter in production.'
pubDate: 2024-02-10
category: 'software-engineering'
tags: ['distributed-systems', 'architecture', 'consensus', 'cap-theorem']
draft: false
---

Every monolith eventually becomes a distributed system. The question isn't *if* you'll deal with network partitions, clock skew, and partial failures it's *when*. And when that day comes, most engineers realize they've been operating under assumptions that simply don't hold at scale.

This post distills the core mental models I wish someone had handed me before I debugged my first split-brain scenario at 2 AM.

## The Eight Fallacies That Will Burn You

Peter Deutsch's [fallacies of distributed computing](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing) aren't academic theory they're a checklist of assumptions your code is silently making:

1. **The network is reliable** Packets drop. Connections reset. Cables get unplugged.
2. **Latency is zero** A cross-region call adds 50–200ms. Your tight loop just became a bottleneck.
3. **Bandwidth is infinite** Serialize a 10MB payload across 1000 RPCs/sec. Watch the network choke.
4. **The network is secure** Every hop is an attack surface.
5. **Topology doesn't change** Nodes join, leave, and get rebalanced. Constantly.
6. **There is one administrator** In microservices, every team owns their infra. Coordination is political.
7. **Transport cost is zero** Serialization, TLS handshakes, load balancer hops they add up.
8. **The network is homogeneous** Your AWS service talks to an on-prem system over a VPN. Different rules apply.

The practical takeaway: **every network call in your code should have a timeout, a retry policy, and a fallback**. If it doesn't, you have a latent production incident waiting to happen.

## CAP Theorem: Choose Your Trade-off

You cannot simultaneously guarantee all three:

- **Consistency** Every read returns the most recent write
- **Availability** Every request gets a response (even if stale)
- **Partition Tolerance** The system works despite network splits

In practice, network partitions *always* happen. So you're really choosing between:

| Type | Behavior During Partition | Examples |
|------|--------------------------|----------|
| **CP** | Rejects writes to preserve consistency | ZooKeeper, etcd, Consul, CockroachDB |
| **AP** | Accepts writes, resolves conflicts later | Cassandra, DynamoDB, Riak |

**The nuance nobody tells you**: CAP is a spectrum, not a binary choice. Most production systems are CP for some operations and AP for others. DynamoDB is AP for writes but offers strongly-consistent reads as an option. PostgreSQL with synchronous replication is CP but can be configured for async (AP-like) behavior.

## Consensus: The Hardest Problem in Distributed Computing

Getting N nodes to agree on a single value despite failures, message delays, and concurrent proposals is fundamentally hard. This is the **consensus problem**.

### Paxos

Lamport's Paxos is provably correct but notoriously difficult to implement. Google's Chubby team reported that "there are significant gaps between the description of the Paxos algorithm and the needs of a real-world system." Most engineers who claim to understand Paxos are lying.

### Raft

Designed explicitly for understandability. Same guarantees as Paxos, but with a clear leader election → log replication → safety proof structure.

```
┌─────────────────────────────────────────┐
│  Client → Leader → Followers (majority)  │
│         ← Commit  ← ACK                 │
└─────────────────────────────────────────┘

1. Client sends write to leader
2. Leader appends to local log
3. Leader replicates to followers
4. Majority ACK → committed
5. Leader responds to client
```

**Use existing implementations**: etcd (Raft), CockroachDB (Multi-Raft), Consul (Raft). Writing your own consensus protocol is a multi-year project with subtle correctness bugs.

## Failure Modes You Must Design For

| Failure | Description | Mitigation |
|---------|-------------|------------|
| **Crash failure** | Node dies completely | Replication, health checks, auto-restart |
| **Omission failure** | Messages lost silently | Timeouts, retries with backoff |
| **Byzantine failure** | Node behaves arbitrarily (lies) | BFT protocols (expensive, rare in enterprise) |
| **Network partition** | Subset of nodes can't reach others | Quorum-based decisions, split-brain detection |
| **Clock skew** | Nodes disagree on current time | Logical clocks (Lamport), hybrid clocks (CockroachDB) |

## Patterns That Actually Work in Production

- **Idempotent operations** Design every write so applying it twice produces the same result. Use unique request IDs.
- **Circuit breakers** Stop calling a failing service. Let it recover. Hystrix pattern.
- **Exponential backoff with jitter** Retries without thundering herd. `delay = min(base * 2^attempt + random_jitter, max_delay)`
- **Sagas over 2PC** Two-phase commit doesn't scale. Use compensating transactions with eventual consistency.
- **Event sourcing** Store facts (events), derive state. Natural audit trail. Replay for debugging.
- **CQRS** Separate read and write models when their access patterns diverge.

## Key Takeaways

- Assume every network call will fail. Code the happy path, but design the failure path first.
- CAP is not a theorem you prove it's a trade-off you choose per operation.
- Don't build consensus from scratch. Use etcd, ZooKeeper, or Consul.
- Idempotency is your single most important design constraint.
- Observability > Prevention. You cannot prevent all failures. You must detect and recover fast.

The best distributed systems engineers aren't the ones who build clever algorithms they're the ones who build systems that degrade gracefully when everything goes wrong simultaneously.
