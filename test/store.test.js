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
