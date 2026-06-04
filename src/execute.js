import { renderList } from './render.js';
import { ValidationError } from './errors.js';

export const USAGE = 'Usage: todo <add <text> | list | done <id>>';

// Dispatch one command against `store` and return { code, out, err }. This is the
// single place errors are caught. It never prints and never calls process.exit —
// that keeps it fully testable in-process and lets one store drive the whole loop
// (both the one-shot CLI and the interactive REPL go through here).
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
