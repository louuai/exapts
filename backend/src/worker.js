/**
 * Worker entry point.
 * Started as a separate Docker service:  `npm run worker`
 *
 * Runs BullMQ workers consuming jobs enqueued by the API:
 *   - notifications (fan-out)
 *   - email (transactional, currently stubbed → console)
 */
import 'dotenv/config';
import { createEmailWorker }        from './workers/email-worker.js';
import { createNotificationWorker } from './workers/notification-worker.js';

console.log('  OMEGA workers booting…');

const workers = [
  createEmailWorker(),
  createNotificationWorker(),
];

workers.forEach((w) => {
  w.on('completed', (job) => console.log(`  ✓ [${job.queueName}:${job.name}] #${job.id}`));
  w.on('failed',    (job, err) => console.error(`  ✗ [${job?.queueName}:${job?.name}] #${job?.id} → ${err?.message}`));
});

console.log(`  OMEGA workers ready — ${workers.length} workers running.\n`);

const shutdown = async () => {
  console.log('\n  shutting workers down…');
  for (const w of workers) await w.close();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
