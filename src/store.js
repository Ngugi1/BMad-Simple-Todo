import { makeTask } from './task.js';
import { ValidationError } from './errors.js';

// Factory (not a singleton): each call returns a fresh, isolated store.
// The store is the single source of truth and the sole ID minter.
export function createStore() {
  const tasks = [];
  let nextId = 1;

  // add(text) -> created Task. Throws ValidationError on empty/whitespace text,
  // before the counter is touched, so a rejected add leaves no gap in ids.
  function add(text) {
    if (typeof text !== 'string' || text.trim() === '') {
      throw new ValidationError('task text must not be empty');
    }
    const task = makeTask(nextId, text);
    nextId += 1;
    tasks.push(task);
    return task;
  }

  // list() -> a shallow copy of all tasks (in insertion order). Returning a copy
  // keeps the internal array reachable only through the seam.
  function list() {
    return [...tasks];
  }

  return { add, list };
}
