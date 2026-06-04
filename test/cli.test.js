import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

import { execute } from '../bin/todo.js';
import { createStore } from '../src/store.js';

// --- In-process dispatcher tests (deterministic; ansi defaults to false) ---

test('end-to-end loop: add -> list -> done -> list (one shared store)', () => {
  const store = createStore();

  const added = execute(['add', 'Write', 'the', 'demo', 'script'], store);
  assert.equal(added.code, 0);

  const list1 = execute(['list'], store);
  assert.equal(list1.code, 0);
  assert.equal(list1.out, '[ ] 1. Write the demo script');

  const done = execute(['done', '1'], store);
  assert.equal(done.code, 0);

  const list2 = execute(['list'], store);
  assert.equal(list2.out, '[x] 1. ~~Write the demo script~~');
});

test('add success returns code 0 and the new task line', () => {
  const result = execute(['add', 'milk'], createStore());
  assert.equal(result.code, 0);
  assert.equal(result.out, '[ ] 1. milk');
  assert.equal(result.err, '');
});

test('list on an empty store returns "No tasks." with code 0', () => {
  assert.deepEqual(execute(['list'], createStore()), { code: 0, out: 'No tasks.', err: '' });
});

test('add with empty text returns code 1 and a stderr message, no stdout', () => {
  const result = execute(['add'], createStore());
  assert.equal(result.code, 1);
  assert.equal(result.out, '');
  assert.ok(result.err.length > 0);
});

test('done with an unknown id returns code 1 and leaves the task open', () => {
  const store = createStore();
  store.add('a');
  const result = execute(['done', '999'], store);
  assert.equal(result.code, 1);
  assert.ok(result.err.length > 0);
  assert.deepEqual(store.list(), [{ id: 1, text: 'a', done: false }]);
});

test('done with a non-numeric id returns code 1 and does not throw', () => {
  const store = createStore();
  store.add('a');
  let result;
  assert.doesNotThrow(() => {
    result = execute(['done', 'abc'], store);
  });
  assert.equal(result.code, 1);
});

test('unknown and missing commands return code 1 with usage text', () => {
  const unknown = execute(['frobnicate'], createStore());
  assert.equal(unknown.code, 1);
  assert.match(unknown.err, /usage/i);

  const missing = execute([], createStore());
  assert.equal(missing.code, 1);
  assert.match(missing.err, /usage/i);
});

// --- Spawn-based tests: real process exit codes & stream routing ---

const runCli = (args) =>
  spawnSync(process.execPath, ['bin/todo.js', ...args], { encoding: 'utf8' });

test('spawn: list on a fresh process prints to stdout and exits 0', () => {
  const r = runCli(['list']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /No tasks\./);
  assert.equal(r.stderr, '');
});

test('spawn: unknown command exits non-zero, writes stderr, no stack trace', () => {
  const r = runCli(['frobnicate']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /usage/i);
  assert.equal(r.stdout, '');
  assert.doesNotMatch(r.stderr, /\n\s*at\s+/); // no stack frames
});

test('spawn: empty add exits non-zero and writes stderr only', () => {
  const r = runCli(['add']);
  assert.notEqual(r.status, 0);
  assert.ok(r.stderr.length > 0);
  assert.equal(r.stdout, '');
});
