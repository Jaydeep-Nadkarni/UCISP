import { selectNext } from './Scheduler.js';

export class TaskQueue {
  constructor(policy = 'priority') { this.policy = policy; this.tasks = []; }
  enqueue(task) { this.tasks.push({ ...task, status: 'pending', arrivalTime: task.arrivalTime || new Date() }); }
  next() {
    const task = selectNext(this.tasks.filter((item) => item.status === 'pending'), this.policy);
    if (task) task.status = 'running';
    return task || null;
  }
  complete(id) { const task = this.tasks.find((item) => item.id === id); if (task) task.status = 'completed'; }
  fail(id, error) { const task = this.tasks.find((item) => item.id === id); if (task) { task.status = 'failed'; task.errorMessage = error.message; } }
}
