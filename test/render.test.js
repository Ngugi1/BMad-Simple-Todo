import { test } from 'node:test';
import assert from 'node:assert/strict';

import { renderList } from '../src/render.js';

test('empty task list renders the no-tasks indication', () => {
  assert.equal(renderList([]), 'No tasks.');
});

test('open tasks render as "[ ] <id>. <text>", one per line, no trailing newline', () => {
  const out = renderList([
    { id: 1, text: 'a', done: false },
    { id: 2, text: 'b', done: false },
  ]);
  assert.equal(out, '[ ] 1. a\n[ ] 2. b');
});

test('completed task uses [x] checkbox + plain strike-through fallback when ansi is off', () => {
  assert.equal(renderList([{ id: 1, text: 'done thing', done: true }]), '[x] 1. ~~done thing~~');
});

test('completed task uses [x] checkbox + ANSI strike-through when ansi is on', () => {
  assert.equal(
    renderList([{ id: 1, text: 'x', done: true }], { ansi: true }),
    '[x] 1. \x1b[9mx\x1b[0m',
  );
});

test('mixed open and completed tasks render with their checkboxes (plain)', () => {
  const out = renderList([
    { id: 1, text: 'open', done: false },
    { id: 2, text: 'closed', done: true },
  ]);
  assert.equal(out, '[ ] 1. open\n[x] 2. ~~closed~~');
});
