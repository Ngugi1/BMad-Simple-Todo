import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createStore } from '../src/store.js';
import { ValidationError } from '../src/errors.js';

test('add creates a Task with the given text, done=false, and id=1', () => {
  const store = createStore();
  const task = store.add('Write the demo script');
  assert.deepEqual(task, { id: 1, text: 'Write the demo script', done: false });
});

test('a second add receives id=2 (store retains its counter)', () => {
  const store = createStore();
  store.add('first');
  const second = store.add('second');
  assert.equal(second.id, 2);
});

test('add rejects empty text with a ValidationError', () => {
  const store = createStore();
  assert.throws(() => store.add(''), ValidationError);
});

test('add rejects whitespace-only text with a ValidationError', () => {
  const store = createStore();
  assert.throws(() => store.add('   '), ValidationError);
  assert.throws(() => store.add('\t\n'), ValidationError);
});

test('a rejected add does not advance the id counter (no gap)', () => {
  const store = createStore();
  store.add('first'); // id 1
  assert.throws(() => store.add('   '), ValidationError);
  const next = store.add('second');
  assert.equal(next.id, 2);
});

test('list on a fresh store returns an empty array', () => {
  const store = createStore();
  assert.deepEqual(store.list(), []);
});

test('list returns all tasks in insertion order', () => {
  const store = createStore();
  store.add('a');
  store.add('b');
  assert.deepEqual(store.list(), [
    { id: 1, text: 'a', done: false },
    { id: 2, text: 'b', done: false },
  ]);
});

test('list returns a copy — mutating it does not affect the store', () => {
  const store = createStore();
  store.add('a');
  const first = store.list();
  first.pop();
  assert.equal(store.list().length, 1);
});

test('complete sets done=true; the task stays in the store and shows in list', () => {
  const store = createStore();
  store.add('a');
  store.complete(1);
  assert.deepEqual(store.list(), [{ id: 1, text: 'a', done: true }]);
});

test('complete returns the completed task on success', () => {
  const store = createStore();
  store.add('a');
  const result = store.complete(1);
  assert.deepEqual(result, { id: 1, text: 'a', done: true });
});

test('complete changes only the target task', () => {
  const store = createStore();
  store.add('a');
  store.add('b');
  store.complete(2);
  assert.deepEqual(store.list(), [
    { id: 1, text: 'a', done: false },
    { id: 2, text: 'b', done: true },
  ]);
});

test('complete is idempotent — re-completing keeps done=true and returns the task', () => {
  const store = createStore();
  store.add('a');
  store.complete(1);
  const second = store.complete(1);
  assert.deepEqual(second, { id: 1, text: 'a', done: true });
});

test('complete with an unknown id returns null and changes nothing', () => {
  const store = createStore();
  store.add('a');
  const result = store.complete(999);
  assert.equal(result, null);
  assert.deepEqual(store.list(), [{ id: 1, text: 'a', done: false }]);
});

test('complete with an unknown id does not throw', () => {
  const store = createStore();
  store.add('a');
  assert.doesNotThrow(() => store.complete(999));
});
