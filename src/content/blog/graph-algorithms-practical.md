---
title: 'Graph Algorithms You Actually Use in Production'
description: 'BFS, DFS, Dijkstra, topological sort e graph algorithms that show up in real systems, not just interviews.'
pubDate: 2024-03-28
category: 'computer-science'
tags: ['algorithms', 'graphs', 'data-structures', 'systems-design']
draft: false
readingTime: '10 min read'
---

## Graphs Are Everywhere

Dependency resolution (package managers), network routing, social connections, database query planning, build systems ey're all graph problems in disguise.

## BFS: Shortest Path in Unweighted Graphs

Breadth-first search explores level by level. Perfect for finding the shortest path when all edges have equal weight.

```python
from collections import deque

def bfs_shortest_path(graph, start, end):
    queue = deque([(start, [start])])
    visited = {start}
    
    while queue:
        node, path = queue.popleft()
        if node == end:
            return path
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return None  # No path exists
```

**Real use:** Finding the shortest chain of dependencies between two packages.

## DFS: Cycle Detection

Depth-first search goes as deep as possible before backtracking. Essential for detecting cycles.

```python
def has_cycle(graph):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}
    
    def dfs(node):
        color[node] = GRAY
        for neighbor in graph[node]:
            if color[neighbor] == GRAY:
                return True  # Back edge = cycle
            if color[neighbor] == WHITE and dfs(neighbor):
                return True
        color[node] = BLACK
        return False
    
    return any(dfs(node) for node in graph if color[node] == WHITE)
```

**Real use:** Detecting circular dependencies in build systems.

## Topological Sort: Dependency Ordering

Order nodes so that for every edge (u, v), u comes before v. Only works on DAGs (directed acyclic graphs).

```python
def topological_sort(graph):
    in_degree = {node: 0 for node in graph}
    for node in graph:
        for neighbor in graph[node]:
            in_degree[neighbor] += 1
    
    queue = deque([n for n in in_degree if in_degree[n] == 0])
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    if len(result) != len(graph):
        raise ValueError("Graph has a cycle")
    return result
```

**Real use:** Task scheduling, build order (Make, Gradle), course prerequisites.

## Dijkstra: Weighted Shortest Path

When edges have different weights (costs, latencies):

```python
import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    
    while pq:
        dist, node = heapq.heappop(pq)
        if dist > distances[node]:
            continue
        
        for neighbor, weight in graph[node]:
            new_dist = dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                heapq.heappush(pq, (new_dist, neighbor))
    
    return distances
```

**Real use:** Network routing (OSPF), map navigation, resource allocation.

## Union-Find: Connected Components

Efficiently tracks which nodes belong to the same connected component:

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]
    
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True
```

**Real use:** Network connectivity, image segmentation, Kruskal's MST.

These aren't academic exercises ey're the algorithms running inside your package manager, your database, and your network router right now.
