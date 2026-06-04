// Sole authority for list output formatting. Pure function — returns a string,
// never prints and never reads process.stdout. The caller (entrypoint) decides
// `ansi` from process.stdout.isTTY.

const ANSI_STRIKE_ON = '\x1b[9m';
const ANSI_STRIKE_OFF = '\x1b[0m';
const NO_TASKS = 'No tasks.';
const CHECKBOX_OPEN = '[ ]';
const CHECKBOX_DONE = '[x]';

// Completed tasks additionally get strike-through on the text: ANSI code 9 on a
// TTY, plain `~~text~~` fallback otherwise.
function strike(text, ansi) {
  return ansi ? `${ANSI_STRIKE_ON}${text}${ANSI_STRIKE_OFF}` : `~~${text}~~`;
}

// Line format: "<checkbox> <id>. <text>". The `[ ]`/`[x]` checkbox is the
// completion signal (no `(done)` suffix); done tasks also have struck-through text.
export function renderList(tasks, { ansi = false } = {}) {
  if (tasks.length === 0) {
    return NO_TASKS;
  }
  return tasks
    .map((task) => {
      const checkbox = task.done ? CHECKBOX_DONE : CHECKBOX_OPEN;
      const text = task.done ? strike(task.text, ansi) : task.text;
      return `${checkbox} ${task.id}. ${text}`;
    })
    .join('\n');
}
