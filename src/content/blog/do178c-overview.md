---
title: 'DO-178C Software in the Sky'
description: 'An overview of DO-178C certification for airborne software: what it requires, why it matters, and how it shapes how we write code.'
pubDate: 2026-03-12
category: 'aerospace'
tags: ['do-178c', 'safety-critical', 'avionics', 'certification', 'flight-software']
draft: false
---

## What is DO-178C?

DO-178C is the standard for developing airborne software. If your code runs on an aircraft, it must comply. There are no shortcuts.

## Design Assurance Levels

| Level | Failure Condition | Example |
|-------|------------------|---------|
| A | Catastrophic | Flight control, autopilot |
| B | Hazardous | Engine control, navigation |
| C | Major | Fuel management, comms |
| D | Minor | Passenger entertainment |
| E | No effect | Maintenance logging |

## What It Means in Practice

- **100% MC/DC coverage** at Level A every boolean condition tested independently
- **Traceability**: Requirements → Design → Code → Tests (bidirectional)
- **No dead code**: Every line must be justified
- **Formal reviews**: Code reviews aren't optional, they're auditable artifacts

## The Mindset Shift

In web dev, you ship fast and fix in production. In avionics, there is no "hotfix at 35,000 feet." You prove correctness before the first flight.
