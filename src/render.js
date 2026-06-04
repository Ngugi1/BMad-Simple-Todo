// Sole authority for list output formatting. Pure function — returns a string,
// never prints and never reads process.stdout. The caller (entrypoint) decides
// `ansi` from process.stdout.isTTY.

const ANSI_STRIKE_ON = '\x1b[9m';
const ANSI_STRIKE_OFF = '\x1b[0m';
const NO_TASKS = 'No tasks.';

// Completed tasks are shown struck-through (the strike-through is the completion
// signal). ANSI code 9 on a TTY; plain `~~text~~` fallback otherwise.
function strike(text, ansi) {
  return ansi ? `${ANSI_STRIKE_ON}${text}${ANSI_STRIKE_OFF}` : `~~${text}~~`;
}

export function renderList(tasks, { ansi = false } = {}) {
  if (tasks.length === 0) {
    return NO_TASKS;
  }
  return tasks
    .map((task) => `${task.id}. ${task.done ? strike(task.text, ansi) : task.text}`)
    .join('\n');
}
