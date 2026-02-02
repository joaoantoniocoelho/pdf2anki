/**
 * In-memory concurrency controls for generation and LLM calls.
 * No Redis or persistent queue - for future migration.
 */

const MAX_SIMULTANEOUS_GENERATIONS = 2;
const MAX_SIMULTANEOUS_LLM_CALLS = 6;

/** Semaphore for global generation slots (max 2 per instance for MVP cost control) */
class GenerationSemaphore {
  private permits = MAX_SIMULTANEOUS_GENERATIONS;
  private waitQueue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    await new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
    return this.acquire();
  }

  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) next();
    }
  }

  getAvailable(): number {
    return this.permits;
  }

  /** Non-blocking: returns true if acquired, false if no slot available */
  tryAcquire(): boolean {
    if (this.permits > 0) {
      this.permits--;
      return true;
    }
    return false;
  }
}

/** Per-user active generation tracking */
class UserGenerationTracker {
  private active = new Set<string>();

  tryAcquire(userId: string): boolean {
    if (this.active.has(userId)) return false;
    this.active.add(userId);
    return true;
  }

  release(userId: string): void {
    this.active.delete(userId);
  }
}

/** Semaphore for LLM calls (max 6 per instance) */
class LlmSemaphore {
  private permits = MAX_SIMULTANEOUS_LLM_CALLS;
  private waitQueue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    await new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
    return this.acquire();
  }

  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) next();
    }
  }
}

export const generationSemaphore = new GenerationSemaphore();
export const userGenerationTracker = new UserGenerationTracker();
export const llmSemaphore = new LlmSemaphore();

export async function acquireGenerationSlot(): Promise<void> {
  await generationSemaphore.acquire();
}

/** Non-blocking: returns true if slot acquired, false if limit reached */
export function tryAcquireGenerationSlot(): boolean {
  return generationSemaphore.tryAcquire();
}

export function releaseGenerationSlot(): void {
  generationSemaphore.release();
}

export function tryAcquireUserSlot(userId: string): boolean {
  return userGenerationTracker.tryAcquire(userId);
}

export function releaseUserSlot(userId: string): void {
  userGenerationTracker.release(userId);
}

export async function withLlmSlot<T>(fn: () => Promise<T>): Promise<T> {
  await llmSemaphore.acquire();
  try {
    return await fn();
  } finally {
    llmSemaphore.release();
  }
}

export function isGenerationSlotAvailable(): boolean {
  return generationSemaphore.getAvailable() > 0;
}
