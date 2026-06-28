---
title: 'Distributed Systems What I Wish I Knew Earlier'
description: 'Key concepts every engineer should understand before building distributed systems: CAP theorem, consensus, and failure modes.'
pubDate: 2024-02-10
category: 'software-engineering'
tags: ['distributed-systems', 'architecture', 'consensus', 'cap-theorem']
draft: false
---

## The Fallacies

Every distributed system eventually teaches you the [eight fallacies](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing):

1. The network is reliable
2. Latency is zero
3. Bandwidth is infinite
4. The network is secure
5. Topology doesn't change
6. There is one administrator
7. Transport cost is zero
8. The network is homogeneous

## CAP Theorem in Practice

You can't have all three: Consistency, Availability, Partition tolerance. In practice, partitions happen so you're choosing between CP and AP.

- **CP systems**: ZooKeeper, etcd, Consul strong consistency, may reject writes during partitions
- **AP systems**: Cassandra, DynamoDB always available, eventually consistent

## Consensus is Hard

Paxos is correct but incomprehensible. Raft is understandable but still tricky to implement. Use existing implementations (etcd, CockroachDB) unless you have a very good reason not to.

## Key Takeaway

Design for failure. Every network call can fail, timeout, or return stale data. Build idempotent operations. Use circuit breakers. Log everything.
