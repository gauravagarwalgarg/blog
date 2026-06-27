---
title: 'Python Decorators and Metaclasses: Advanced Patterns'
description: 'Going beyond @property iting decorators with arguments, class decorators, and when metaclasses are actually the right tool.'
pubDate: 2024-05-28
category: 'python'
tags: ['python', 'decorators', 'metaclasses', 'advanced', 'design-patterns']
draft: false
readingTime: '9 min read'
---

## Decorators: Functions That Return Functions

At its core, a decorator replaces a function with a wrapper:

```python
def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def heavy_computation(n):
    return sum(i**2 for i in range(n))
```

## Decorators with Arguments

This requires an extra layer of nesting:

```python
def retry(max_attempts=3, delay=1.0):
    def decorator(func):
        import time
        from functools import wraps
        
        @wraps(func)  # Preserves __name__, __doc__
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=5, delay=2.0)
def fetch_data(url):
    ...
```

## Class Decorators

Decorators can also modify classes:

```python
def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class DatabaseConnection:
    def __init__(self, url):
        self.url = url
        self.connect()
```

## Metaclasses: Classes That Create Classes

A metaclass controls how a class itself is created. Every class in Python is an instance of a metaclass (usually `type`).

```python
class ValidatedMeta(type):
    def __new__(mcs, name, bases, namespace):
        # Enforce that all methods have docstrings
        for key, value in namespace.items():
            if callable(value) and not key.startswith('_'):
                if not value.__doc__:
                    raise TypeError(
                        f"Method {name}.{key} must have a docstring"
                    )
        return super().__new__(mcs, name, bases, namespace)

class APIEndpoint(metaclass=ValidatedMeta):
    def get(self, request):
        """Handle GET requests."""
        ...
    
    def post(self, request):  # TypeError! No docstring
        ...
```

## When to Use Metaclasses

Almost never. But legitimate use cases:
- **ORM field registration** (Django models)
- **Abstract base class enforcement** (abc.ABCMeta)
- **Automatic registration** (plugin systems)
- **API validation at class definition time**

## The Hierarchy

```
type → metaclass → class → instance
type("MyClass", (Base,), {"method": fn}) == class MyClass(Base): ...
```

## Prefer `__init_subclass__` (Python 3.6+)

For most metaclass use cases, `__init_subclass__` is simpler:

```python
class Plugin:
    registry = {}
    
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry[cls.__name__] = cls

class ImageProcessor(Plugin):
    ...

class VideoProcessor(Plugin):
    ...

print(Plugin.registry)
# {'ImageProcessor': <class 'ImageProcessor'>, 'VideoProcessor': <class 'VideoProcessor'>}
```

Rule of thumb: decorators > `__init_subclass__` > metaclasses. Use the simplest tool that solves the problem.
