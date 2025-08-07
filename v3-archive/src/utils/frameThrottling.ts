/**
 * Frame Throttling and Animation Scheduling System
 * 
 * Provides intelligent frame management to maintain 60fps by:
 * - Throttling expensive operations
 * - Scheduling work across multiple frames
 * - Monitoring frame budget and adapting behavior
 * - Prioritizing user interactions over background animations
 */

import { PERFORMANCE_CONFIG } from './animationOptimizations';

export type FramePriority = 'immediate' | 'high' | 'normal' | 'low' | 'idle';

interface ScheduledWork {
  id: string;
  work: () => void;
  priority: FramePriority;
  deadline?: number;
  createdAt: number;
}

/**
 * Advanced frame scheduler that maintains 60fps by intelligently
 * distributing work across frames based on priority and frame budget
 */
export class FrameScheduler {
  private workQueue: ScheduledWork[] = [];
  private isRunning = false;
  private frameStartTime = 0;
  private lastFrameTime = 0;
  private frameId?: number;
  private frameTimeHistory: number[] = [];
  private adaptiveThreshold: number = PERFORMANCE_CONFIG.MAX_FRAME_TIME_MS;

  constructor() {
    this.updateAdaptiveThreshold();
  }

  /**
   * Schedule work to be executed with frame budget awareness
   */
  schedule(
    id: string,
    work: () => void,
    priority: FramePriority = 'normal',
    deadline?: number
  ): void {
    // Remove existing work with same ID
    this.workQueue = this.workQueue.filter(item => item.id !== id);
    
    const scheduledWork: ScheduledWork = {
      id,
      work,
      priority,
      deadline,
      createdAt: performance.now(),
    };

    // Insert based on priority
    this.insertByPriority(scheduledWork);
    
    if (!this.isRunning) {
      this.startProcessing();
    }
  }

  /**
   * Cancel scheduled work
   */
  cancel(id: string): boolean {
    const initialLength = this.workQueue.length;
    this.workQueue = this.workQueue.filter(item => item.id !== id);
    return this.workQueue.length < initialLength;
  }

  /**
   * Get current frame budget remaining
   */
  getRemainingFrameBudget(): number {
    const elapsed = performance.now() - this.frameStartTime;
    return Math.max(0, this.adaptiveThreshold - elapsed);
  }

  /**
   * Check if we have enough frame budget for an operation
   */
  hasFrameBudget(estimatedTime: number = 2): boolean {
    return this.getRemainingFrameBudget() > estimatedTime;
  }

  private insertByPriority(work: ScheduledWork): void {
    const priorityOrder: FramePriority[] = ['immediate', 'high', 'normal', 'low', 'idle'];
    const workPriorityIndex = priorityOrder.indexOf(work.priority);
    
    let insertIndex = 0;
    for (let i = 0; i < this.workQueue.length; i++) {
      const itemPriorityIndex = priorityOrder.indexOf(this.workQueue[i].priority);
      if (workPriorityIndex <= itemPriorityIndex) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }
    
    this.workQueue.splice(insertIndex, 0, work);
  }

  private startProcessing(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.frameId = requestAnimationFrame(this.processFrame);
  }

  private processFrame = (currentTime: number): void => {
    this.frameStartTime = currentTime;
    
    // Track frame time for adaptive threshold
    if (this.lastFrameTime > 0) {
      const frameTime = currentTime - this.lastFrameTime;
      this.frameTimeHistory.push(frameTime);
      if (this.frameTimeHistory.length > 60) {
        this.frameTimeHistory.shift();
      }
    }
    this.lastFrameTime = currentTime;

    // Update adaptive threshold every 60 frames
    if (this.frameTimeHistory.length === 60) {
      this.updateAdaptiveThreshold();
    }

    // Process work items until frame budget is exhausted
    while (this.workQueue.length > 0) {
      const remainingBudget = this.getRemainingFrameBudget();
      
      // If we're running low on frame budget, only process immediate priority
      if (remainingBudget < 2 && this.workQueue[0].priority !== 'immediate') {
        break;
      }

      const work = this.workQueue.shift()!;
      
      // Check if work has expired
      if (work.deadline && currentTime > work.deadline) {
        continue;
      }

      // Execute work and measure time
      const workStartTime = performance.now();
      try {
        work.work();
      } catch (error) {
        console.error(`Scheduled work failed (${work.id}):`, error);
      }
      const workEndTime = performance.now();
      const workDuration = workEndTime - workStartTime;

      // If work took too long, be more conservative with remaining work
      if (workDuration > 5) {
        this.adaptiveThreshold = Math.max(8, this.adaptiveThreshold - 1);
        break;
      }
    }

    // Continue processing if there's more work
    if (this.workQueue.length > 0) {
      this.frameId = requestAnimationFrame(this.processFrame);
    } else {
      this.isRunning = false;
    }
  };

  private updateAdaptiveThreshold(): void {
    if (this.frameTimeHistory.length < 10) return;

    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    const maxFrameTime = Math.max(...this.frameTimeHistory);
    
    // Adaptive threshold based on recent performance
    if (avgFrameTime < 12) {
      // Performance is good, we can be more aggressive
      this.adaptiveThreshold = Math.min(PERFORMANCE_CONFIG.MAX_FRAME_TIME_MS, this.adaptiveThreshold + 0.5);
    } else if (avgFrameTime > 15 || maxFrameTime > 20) {
      // Performance is struggling, be more conservative
      this.adaptiveThreshold = Math.max(8, this.adaptiveThreshold - 1);
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const avgFrameTime = this.frameTimeHistory.length > 0 
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length 
      : 0;
    
    return {
      queueLength: this.workQueue.length,
      isRunning: this.isRunning,
      adaptiveThreshold: this.adaptiveThreshold,
      averageFrameTime: avgFrameTime,
      estimatedFPS: avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0,
    };
  }
}

// Global frame scheduler instance
export const frameScheduler = new FrameScheduler();

/**
 * Throttle function that respects frame budget
 */
export function throttleByFrameBudget<T extends (...args: any[]) => any>(
  func: T,
  minInterval: number = 16
): T {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | undefined;

  return ((...args: Parameters<T>) => {
    const now = performance.now();
    const timeSinceLastCall = now - lastCallTime;

    const execute = () => {
      lastCallTime = performance.now();
      return func(...args);
    };

    // If enough time has passed and we have frame budget, execute immediately
    if (timeSinceLastCall >= minInterval && frameScheduler.hasFrameBudget(5)) {
      return execute();
    }

    // Otherwise, schedule for next available frame
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      frameScheduler.schedule(
        `throttled-${func.name}-${Date.now()}`,
        execute,
        'normal'
      );
    }, Math.max(0, minInterval - timeSinceLastCall));
  }) as T;
}

/**
 * Debounce function with frame budget awareness
 */
export function debounceWithFrameBudget<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  priority: FramePriority = 'normal'
): T {
  let timeoutId: NodeJS.Timeout | undefined;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      frameScheduler.schedule(
        `debounced-${func.name}-${Date.now()}`,
        () => func(...args),
        priority
      );
    }, delay);
  }) as T;
}

/**
 * Schedule animation work with priority
 */
export function scheduleAnimationWork(
  work: () => void,
  priority: FramePriority = 'high'
): string {
  const id = `animation-${Date.now()}-${Math.random()}`;
  frameScheduler.schedule(id, work, priority);
  return id;
}

/**
 * Schedule layout work with lower priority
 */
export function scheduleLayoutWork(
  work: () => void,
  priority: FramePriority = 'normal'
): string {
  const id = `layout-${Date.now()}-${Math.random()}`;
  frameScheduler.schedule(id, work, priority);
  return id;
}

/**
 * Schedule idle work that only runs when frame budget allows
 */
export function scheduleIdleWork(work: () => void): string {
  const id = `idle-${Date.now()}-${Math.random()}`;
  frameScheduler.schedule(id, work, 'idle');
  return id;
}