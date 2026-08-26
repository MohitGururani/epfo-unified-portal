import { QueueJob } from './types.js';

type JobHandler<T = any> = (job: QueueJob<T>) => Promise<void>;

interface ExchangeQueue {
  name: string;
  jobs: QueueJob[];
  deadLetterJobs: QueueJob[];
  handlers: JobHandler[];
}

class RabbitMQEmulator {
  private queues: Map<string, ExchangeQueue> = new Map();
  public stats = {
    messagesPublished: 18,
    messagesAcked: 16,
    messagesNacked: 2,
    deadLetterCount: 1,
    activeWorkersCount: 3,
  };

  constructor() {
    this.createQueue('claims.processing');
    this.createQueue('notifications.dispatch');
    this.createQueue('reconciliation.events');
    this.createQueue('dead.letter.queue');
  }

  createQueue(name: string) {
    if (!this.queues.has(name)) {
      this.queues.set(name, {
        name,
        jobs: [],
        deadLetterJobs: [],
        handlers: [],
      });
    }
  }

  publish<T = any>(queueName: string, payload: T, maxRetries = 3): QueueJob<T> {
    this.createQueue(queueName);
    const queue = this.queues.get(queueName)!;

    const job: QueueJob<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      queue: queueName,
      payload,
      status: 'QUEUED',
      retryCount: 0,
      maxRetries,
      createdAt: new Date().toISOString(),
    };

    queue.jobs.push(job);
    this.stats.messagesPublished++;

    // Trigger async worker consumer non-blockingly
    setTimeout(() => {
      this.processNext(queueName);
    }, 50);

    return job;
  }

  subscribe<T = any>(queueName: string, handler: JobHandler<T>) {
    this.createQueue(queueName);
    const queue = this.queues.get(queueName)!;
    queue.handlers.push(handler);
  }

  private async processNext(queueName: string) {
    const queue = this.queues.get(queueName);
    if (!queue || queue.handlers.length === 0) return;

    const pendingJob = queue.jobs.find((j) => j.status === 'QUEUED');
    if (!pendingJob) return;

    pendingJob.status = 'PROCESSING';

    // Execute handlers
    for (const handler of queue.handlers) {
      try {
        await handler(pendingJob);
        pendingJob.status = 'COMPLETED';
        pendingJob.processedAt = new Date().toISOString();
        this.stats.messagesAcked++;
      } catch (err: any) {
        pendingJob.retryCount++;
        pendingJob.error = err?.message || 'Processing error';
        
        if (pendingJob.retryCount < pendingJob.maxRetries) {
          pendingJob.status = 'QUEUED'; // Re-queue
          this.stats.messagesNacked++;
          setTimeout(() => this.processNext(queueName), 2000);
        } else {
          // Send to Dead Letter Queue
          pendingJob.status = 'FAILED';
          queue.deadLetterJobs.push(pendingJob);
          const dlq = this.queues.get('dead.letter.queue');
          if (dlq) {
            dlq.jobs.push(pendingJob);
          }
          this.stats.deadLetterCount++;
        }
      }
    }
  }

  getQueuesSummary() {
    const summary: {
      name: string;
      readyCount: number;
      processingCount: number;
      completedCount: number;
      deadLetterCount: number;
      totalMessages: number;
    }[] = [];

    for (const [name, q] of this.queues.entries()) {
      summary.push({
        name,
        readyCount: q.jobs.filter((j) => j.status === 'QUEUED').length,
        processingCount: q.jobs.filter((j) => j.status === 'PROCESSING').length,
        completedCount: q.jobs.filter((j) => j.status === 'COMPLETED').length,
        deadLetterCount: q.deadLetterJobs.length,
        totalMessages: q.jobs.length,
      });
    }

    return summary;
  }

  getAllJobs(queueName?: string): QueueJob[] {
    if (queueName && this.queues.has(queueName)) {
      return this.queues.get(queueName)!.jobs;
    }
    const all: QueueJob[] = [];
    for (const q of this.queues.values()) {
      all.push(...q.jobs);
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  retryDeadLetterJob(jobId: string): boolean {
    for (const q of this.queues.values()) {
      const idx = q.deadLetterJobs.findIndex(j => j.id === jobId);
      if (idx !== -1) {
        const job = q.deadLetterJobs.splice(idx, 1)[0];
        job.status = 'QUEUED';
        job.retryCount = 0;
        job.error = undefined;
        this.publish(job.queue, job.payload);
        return true;
      }
    }
    return false;
  }
}

export const rabbitmq = new RabbitMQEmulator();
