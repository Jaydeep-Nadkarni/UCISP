export async function processTask(task, handler, queue) {
  try {
    await handler(task);
    queue.complete(task.id);
  } catch (error) {
    queue.fail(task.id, error);
    throw error;
  }
}
