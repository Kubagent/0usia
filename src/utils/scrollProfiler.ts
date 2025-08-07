/**
 * Advanced Scroll Performance Profiler
 * Provides flame graph data and detailed performance analysis
 */

interface ProfilerMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface FlameGraphNode {
  name: string;
  value: number;
  children?: FlameGraphNode[];
  x?: number;
  y?: number;
  color?: string;
}

interface PerformanceProfile {
  totalDuration: number;
  marks: ProfilerMark[];
  flameGraph: FlameGraphNode[];
  callStacks: string[][];
  memorySnapshots: number[];
  frameTimings: number[];
}

class ScrollProfiler {
  private marks: Map<string, ProfilerMark> = new Map();
  private profiles: PerformanceProfile[] = [];
  private isRecording = false;
  private startTime = 0;
  private frameTimings: number[] = [];
  private memorySnapshots: number[] = [];
  private callStacks: string[][] = [];

  /**
   * Start profiling session
   */
  startProfiling(): void {
    if (this.isRecording) {
      console.warn('Profiling already in progress');
      return;
    }

    this.isRecording = true;
    this.startTime = performance.now();
    this.marks.clear();
    this.frameTimings = [];
    this.memorySnapshots = [];
    this.callStacks = [];

    // Start frame timing collection
    this.collectFrameTimings();
    
    // Start memory monitoring
    this.collectMemorySnapshots();

    console.log('🔥 Scroll profiling started');
  }

  /**
   * Stop profiling and generate report
   */
  stopProfiling(): PerformanceProfile {
    if (!this.isRecording) {
      console.warn('No profiling session in progress');
      return this.getEmptyProfile();
    }

    this.isRecording = false;
    const totalDuration = performance.now() - this.startTime;

    // Generate flame graph data
    const flameGraph = this.generateFlameGraph();

    const profile: PerformanceProfile = {
      totalDuration,
      marks: Array.from(this.marks.values()),
      flameGraph,
      callStacks: this.callStacks,
      memorySnapshots: this.memorySnapshots,
      frameTimings: this.frameTimings
    };

    this.profiles.push(profile);
    console.log('🔥 Scroll profiling stopped', profile);
    
    return profile;
  }

  /**
   * Mark start of a performance section
   */
  markStart(name: string, metadata?: Record<string, any>): void {
    if (!this.isRecording) return;

    const mark: ProfilerMark = {
      name,
      startTime: performance.now() - this.startTime,
      metadata
    };

    this.marks.set(name, mark);
    
    // Capture call stack for flame graph
    const stack = this.captureCallStack();
    this.callStacks.push(stack);

    // Use Performance API if available
    if ('mark' in performance) {
      performance.mark(`scroll-${name}-start`);
    }
  }

  /**
   * Mark end of a performance section
   */
  markEnd(name: string): void {
    if (!this.isRecording) return;

    const endTime = performance.now() - this.startTime;
    const mark = this.marks.get(name);

    if (mark) {
      mark.endTime = endTime;
      mark.duration = endTime - mark.startTime;

      // Use Performance API if available
      if ('mark' in performance && 'measure' in performance) {
        performance.mark(`scroll-${name}-end`);
        try {
          performance.measure(`scroll-${name}`, `scroll-${name}-start`, `scroll-${name}-end`);
        } catch (e) {
          // Ignore measurement errors
        }
      }
    }
  }

  /**
   * Time a function execution
   */
  timeFunction<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.markStart(name, metadata);
    try {
      return fn();
    } finally {
      this.markEnd(name);
    }
  }

  /**
   * Time an async function execution
   */
  async timeAsyncFunction<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.markStart(name, metadata);
    try {
      return await fn();
    } finally {
      this.markEnd(name);
    }
  }

  /**
   * Collect frame timing data using RAF
   */
  private collectFrameTimings(): void {
    let lastFrameTime = performance.now();
    
    const collectFrame = (currentTime: number) => {
      if (!this.isRecording) return;

      const frameTime = currentTime - lastFrameTime;
      this.frameTimings.push(frameTime);
      
      // Keep only last 1000 frames to prevent memory issues
      if (this.frameTimings.length > 1000) {
        this.frameTimings.shift();
      }

      lastFrameTime = currentTime;
      requestAnimationFrame(collectFrame);
    };

    requestAnimationFrame(collectFrame);
  }

  /**
   * Collect memory usage snapshots
   */
  private collectMemorySnapshots(): void {
    const collectMemory = () => {
      if (!this.isRecording) return;

      let memoryUsage = 0;
      if ('memory' in performance) {
        memoryUsage = (performance as any).memory.usedJSHeapSize;
      } else {
        // Fallback estimation
        memoryUsage = this.marks.size * 1024 + this.frameTimings.length * 8;
      }

      this.memorySnapshots.push(memoryUsage);

      // Keep only last 100 snapshots
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots.shift();
      }

      setTimeout(collectMemory, 100); // Collect every 100ms
    };

    setTimeout(collectMemory, 100);
  }

  /**
   * Capture current call stack
   */
  private captureCallStack(): string[] {
    const stack = new Error().stack;
    if (!stack) return [];

    return stack
      .split('\n')
      .slice(2) // Remove Error and captureCallStack lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 10); // Limit to 10 frames for performance
  }

  /**
   * Generate flame graph data from collected marks
   */
  private generateFlameGraph(): FlameGraphNode[] {
    const rootNodes: FlameGraphNode[] = [];
    const completedMarks = Array.from(this.marks.values()).filter(mark => mark.duration !== undefined);

    // Sort by start time
    completedMarks.sort((a, b) => a.startTime - b.startTime);

    // Group marks into hierarchical structure
    const nodeStack: FlameGraphNode[] = [];

    completedMarks.forEach(mark => {
      const node: FlameGraphNode = {
        name: mark.name,
        value: mark.duration!,
        children: []
      };

      // Find parent node (overlapping time ranges)
      let parentNode: FlameGraphNode | null = null;
      for (let i = nodeStack.length - 1; i >= 0; i--) {
        const stackNode = nodeStack[i];
        const stackMark = completedMarks.find(m => m.name === stackNode.name);
        
        if (stackMark && 
            mark.startTime >= stackMark.startTime && 
            mark.endTime! <= stackMark.endTime!) {
          parentNode = stackNode;
          break;
        }
      }

      if (parentNode) {
        parentNode.children!.push(node);
      } else {
        rootNodes.push(node);
      }

      nodeStack.push(node);
    });

    return rootNodes;
  }

  /**
   * Generate performance report with flame graph visualization
   */
  generateReport(profile?: PerformanceProfile): string {
    const targetProfile = profile || this.profiles[this.profiles.length - 1];
    
    if (!targetProfile) {
      return 'No profiling data available';
    }

    let report = '🔥 FLAME GRAPH PERFORMANCE REPORT\n';
    report += '════════════════════════════════════\n\n';

    // Overall metrics
    report += `📊 SESSION OVERVIEW\n`;
    report += `──────────────────\n`;
    report += `Total Duration: ${targetProfile.totalDuration.toFixed(2)}ms\n`;
    report += `Total Marks: ${targetProfile.marks.length}\n`;
    report += `Frame Samples: ${targetProfile.frameTimings.length}\n`;
    report += `Memory Samples: ${targetProfile.memorySnapshots.length}\n\n`;

    // Performance bottlenecks
    const slowMarks = targetProfile.marks
      .filter(mark => mark.duration && mark.duration > 16) // Slower than 60fps frame
      .sort((a, b) => (b.duration! - a.duration!));

    if (slowMarks.length > 0) {
      report += `⚠️  PERFORMANCE BOTTLENECKS (>16ms)\n`;
      report += `──────────────────────────────────\n`;
      slowMarks.slice(0, 10).forEach(mark => {
        report += `• ${mark.name}: ${mark.duration!.toFixed(2)}ms\n`;
        if (mark.metadata) {
          Object.entries(mark.metadata).forEach(([key, value]) => {
            report += `  └─ ${key}: ${value}\n`;
          });
        }
      });
      report += '\n';
    }

    // Frame rate analysis
    if (targetProfile.frameTimings.length > 0) {
      const avgFrameTime = targetProfile.frameTimings.reduce((a, b) => a + b, 0) / targetProfile.frameTimings.length;
      const maxFrameTime = Math.max(...targetProfile.frameTimings);
      const fps = 1000 / avgFrameTime;
      const droppedFrames = targetProfile.frameTimings.filter(t => t > 16.67).length;

      report += `🎯 FRAME RATE ANALYSIS\n`;
      report += `────────────────────\n`;
      report += `Average FPS: ${fps.toFixed(1)}\n`;
      report += `Average Frame Time: ${avgFrameTime.toFixed(2)}ms\n`;
      report += `Max Frame Time: ${maxFrameTime.toFixed(2)}ms\n`;
      report += `Dropped Frames: ${droppedFrames} (${((droppedFrames / targetProfile.frameTimings.length) * 100).toFixed(1)}%)\n\n`;
    }

    // Memory analysis
    if (targetProfile.memorySnapshots.length > 0) {
      const maxMemory = Math.max(...targetProfile.memorySnapshots);
      const minMemory = Math.min(...targetProfile.memorySnapshots);
      const avgMemory = targetProfile.memorySnapshots.reduce((a, b) => a + b, 0) / targetProfile.memorySnapshots.length;

      report += `💾 MEMORY ANALYSIS\n`;
      report += `─────────────────\n`;
      report += `Peak Memory: ${(maxMemory / (1024 * 1024)).toFixed(2)}MB\n`;
      report += `Min Memory: ${(minMemory / (1024 * 1024)).toFixed(2)}MB\n`;
      report += `Avg Memory: ${(avgMemory / (1024 * 1024)).toFixed(2)}MB\n`;
      report += `Memory Growth: ${((maxMemory - minMemory) / (1024 * 1024)).toFixed(2)}MB\n\n`;
    }

    // Top level flame graph nodes
    if (targetProfile.flameGraph.length > 0) {
      report += `🔥 FLAME GRAPH (Top Level)\n`;
      report += `─────────────────────────\n`;
      targetProfile.flameGraph
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .forEach(node => {
          report += `• ${node.name}: ${node.value.toFixed(2)}ms\n`;
          if (node.children && node.children.length > 0) {
            const topChild = node.children.sort((a, b) => b.value - a.value)[0];
            report += `  └─ ${topChild.name}: ${topChild.value.toFixed(2)}ms\n`;
          }
        });
    }

    return report;
  }

  /**
   * Export flame graph data for external visualization tools
   */
  exportFlameGraphData(profile?: PerformanceProfile): any {
    const targetProfile = profile || this.profiles[this.profiles.length - 1];
    
    if (!targetProfile) {
      return null;
    }

    // Convert to format compatible with flame graph libraries
    const convertNode = (node: FlameGraphNode, level = 0): any => ({
      name: node.name,
      value: node.value,
      level,
      children: node.children?.map(child => convertNode(child, level + 1)) || []
    });

    return {
      name: 'scroll-session',
      value: targetProfile.totalDuration,
      children: targetProfile.flameGraph.map(node => convertNode(node))
    };
  }

  /**
   * Get empty profile structure
   */
  private getEmptyProfile(): PerformanceProfile {
    return {
      totalDuration: 0,
      marks: [],
      flameGraph: [],
      callStacks: [],
      memorySnapshots: [],
      frameTimings: []
    };
  }

  /**
   * Clear all profiling data
   */
  clearData(): void {
    this.marks.clear();
    this.profiles = [];
    this.frameTimings = [];
    this.memorySnapshots = [];
    this.callStacks = [];
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): PerformanceProfile[] {
    return [...this.profiles];
  }
}

// Create singleton instance
export const scrollProfiler = new ScrollProfiler();

// Utility functions for easy integration
export function profileScrollFunction<T>(name: string, fn: () => T): T {
  return scrollProfiler.timeFunction(name, fn);
}

export async function profileScrollAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return scrollProfiler.timeAsyncFunction(name, fn);
}

// Browser devtools integration
declare global {
  interface Window {
    __scrollProfiler: ScrollProfiler;
    __startScrollProfiling: () => void;
    __stopScrollProfiling: () => PerformanceProfile;
    __getScrollFlameGraph: () => any;
  }
}

// Expose profiler to global scope for debugging
if (typeof window !== 'undefined') {
  window.__scrollProfiler = scrollProfiler;
  window.__startScrollProfiling = () => scrollProfiler.startProfiling();
  window.__stopScrollProfiling = () => scrollProfiler.stopProfiling();
  window.__getScrollFlameGraph = () => scrollProfiler.exportFlameGraphData();
}