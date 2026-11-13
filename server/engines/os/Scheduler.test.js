import test from 'node:test';
import assert from 'node:assert/strict';
import { selectNext } from './Scheduler.js';

const tasks = [
  { id: 'late', priority: 1, arrivalTime: new Date('2026-01-02') },
  { id: 'early', priority: 1, arrivalTime: new Date('2026-01-01') },
  { id: 'important', priority: 5, arrivalTime: new Date('2026-01-03') }
];
test('priority scheduler selects highest priority', () => assert.equal(selectNext(tasks, 'priority').id, 'important'));
test('fcfs scheduler preserves arrival ordering', () => assert.equal(selectNext(tasks, 'fcfs').id, 'early'));
