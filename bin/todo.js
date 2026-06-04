#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { createStore } from '../src/store.js';
import { execute } from '../src/execute.js';
import { startRepl } from '../src/repl.js';

// Re-exported so existing tests (and any importers) can keep pulling execute
// from the entrypoint; the implementation now lives in src/execute.js.
export { execute } from '../src/execute.js';

// The only place that touches the process: one store per invocation, writes the
// streams, sets the exit code. With no command, drop into the interactive loop
// so a single store stays alive across many adds; otherwise run one command.
async function main() {
  const store = createStore();
  const ansi = process.stdout.isTTY === true;
  const argv = process.argv.slice(2);

  if (argv.length === 0) {
    await startRepl(store, { input: process.stdin, output: process.stdout, ansi });
    process.exit(0);
  }

  const { code, out, err } = execute(argv, store, { ansi });
  if (out) process.stdout.write(out + '\n');
  if (err) process.stderr.write(err + '\n');
  process.exit(code);
}

// Run only when invoked directly (`node bin/todo.js` or the linked `todo` command),
// not when imported by tests. realpathSync resolves symlinks (e.g. an npm-link bin).
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
