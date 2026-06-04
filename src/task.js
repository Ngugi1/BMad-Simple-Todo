// Task model: the canonical shape used everywhere is { id, text, done }.
export function makeTask(id, text) {
  return { id, text, done: false };
}
