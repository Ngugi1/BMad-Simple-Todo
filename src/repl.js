import { createInterface } from 'node:readline';

import { execute } from './execute.js';

const PROMPT = 'todo> ';
const WELCOME =
  'Interactive todo. Commands: add <text> | list | done <id> | help | quit';
const HELP = [
  'add <text>   add a task',
  'list         show all tasks',
  'done <id>    complete a task',
  'help         show this help',
  'quit         exit (also Ctrl-D)',
].join('\n');

// Drive an interactive session against a single, long-lived store: one store for
// the whole loop means tasks persist across commands (unlike the one-shot CLI,
// where every invocation starts empty). Reuses execute() so the command behaviour
// is identical to the non-interactive path. Returns a promise that resolves when
// the user quits or input ends (EOF). Streams are injected so this stays testable.
export function startRepl(store, { input, output, ansi = false } = {}) {
  const rl = createInterface({ input, output, prompt: PROMPT });

  const write = (s) => output.write(s + '\n');

  write(WELCOME);
  rl.prompt();

  return new Promise((resolve) => {
    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (trimmed !== '') {
        const [command, ...rest] = trimmed.split(/\s+/);
        if (command === 'quit' || command === 'exit') {
          rl.close();
          return;
        }
        if (command === 'help') {
          write(HELP);
        } else {
          const { out, err } = execute([command, ...rest], store, { ansi });
          if (out) write(out);
          if (err) write(err);
        }
      }
      rl.prompt();
    });

    rl.on('close', () => {
      write('Bye.');
      resolve();
    });
  });
}
