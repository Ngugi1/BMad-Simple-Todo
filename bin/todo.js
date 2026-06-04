#!/usr/bin/env node
import { fileURLToPath } from 'node:url';

import { createStore } from '../src/store.js';
import { renderList } from '../src/render.js';
import { ValidationError } from '../src/errors.js';

const USAGE = 'Usage: todo <add <text> | list | done <id>>';

// Dispatch one command against `store` and return { code, out, err }. This is the
// single place errors are caught. It never prints and never calls process.exit —
// that keeps it fully testable in-process and lets one store drive the whole loop.
export function execute(argv, store, { ansi = false } = {}) {
  const [command, ...rest] = argv;
  try {
    switch (command) {
      case 'add': {
        const task = store.add(rest.join(' '));
        return { code: 0, out: renderList([task], { ansi }), err: '' };
      }
      case 'list':
        return { code: 0, out: renderList(store.list(), { ansi }), err: '' };
      case 'done': {
        const raw = rest[0];
        const id = Number(raw);
        const task = Number.isInteger(id) ? store.complete(id) : null;
        if (!task) {
          return { code: 1, out: '', err: `No task with id "${raw ?? ''}".` };
        }
        return { code: 0, out: renderList([task], { ansi }), err: '' };
      }
      default:
        return { code: 1, out: '', err: USAGE };
    }
  } catch (e) {
    if (e instanceof ValidationError) {
      return { code: 1, out: '', err: e.message };
    }
    return { code: 1, out: '', err: 'Unexpected error.' };
  }
}

// The only place that touches the process: one store per invocation, writes the
// streams, sets the exit code.
function main() {
  const store = createStore();
  const ansi = process.stdout.isTTY === true;
  const { code, out, err } = execute(process.argv.slice(2), store, { ansi });
  if (out) process.stdout.write(out + '\n');
  if (err) process.stderr.write(err + '\n');
  process.exit(code);
}

// Run only when invoked directly (`node bin/todo.js ...`), not when imported by tests.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
