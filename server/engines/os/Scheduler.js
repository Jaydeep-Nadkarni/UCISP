export function selectNext(tasks, policy = 'priority') {
  if (!tasks.length) return null;
  return [...tasks].sort((a, b) => policy === 'fcfs'
    ? new Date(a.arrivalTime) - new Date(b.arrivalTime)
    : (b.priority - a.priority) || (new Date(a.arrivalTime) - new Date(b.arrivalTime)))[0];
}
