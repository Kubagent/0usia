"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { frameScheduler } from '@/utils/frameThrottling';
import { performanceMonitor } from '@/utils/animationOptimizations';

interface PerformanceStats {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  schedulerStats: {
    queueLength: number;
    adaptiveThreshold: number;
    averageFrameTime: number;
    estimatedFPS: number;
  };
  memoryUsage?: {
    usedJSSize?: number;
    totalJSSize?: number;
    limit?: number;
  };
}

interface PerformanceDashboardProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  minimal?: boolean;
  showChart?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  enabled = false,
  position = 'top-left',
  minimal = false,
  showChart = true,
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    droppedFrames: 0,
    schedulerStats: {
      queueLength: 0,
      adaptiveThreshold: 0,
      averageFrameTime: 0,
      estimatedFPS: 0,
    },
  });
  
  const [isVisible, setIsVisible] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const chartDataRef = useRef<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    const updateStats = () => {
      // Get frame scheduler stats
      const schedulerStats = frameScheduler.getStats();
      
      // Get memory usage if available
      let memoryUsage;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = {
          usedJSSize: memory.usedJSHeapSize,
          totalJSSize: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };
      }

      // Calculate FPS from scheduler stats
      const currentFPS = schedulerStats.estimatedFPS || 60;
      
      setStats({
        fps: currentFPS,
        frameTime: schedulerStats.averageFrameTime,
        droppedFrames: 0, // This would need to be tracked separately
        schedulerStats,
        memoryUsage,
      });

      // Update chart data
      chartDataRef.current.push(currentFPS);
      if (chartDataRef.current.length > 50) {
        chartDataRef.current.shift();
      }
    };

    intervalRef.current = setInterval(updateStats, 100); // Update every 100ms
    updateStats(); // Initial update

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    performanceMonitor.startMonitoring();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    const metrics = performanceMonitor.stopMonitoring();
    console.log('Performance monitoring results:', metrics);
  };

  if (!enabled) return null;

  const getPositionStyles = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 10000,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: minimal ? '8px 12px' : '16px 20px',
      borderRadius: '12px',
      fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
      fontSize: minimal ? '11px' : '12px',
      lineHeight: '1.4',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      minWidth: minimal ? '150px' : '280px',
      maxWidth: '350px',
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: 20, left: 20 };
      case 'top-right':
        return { ...base, top: 20, right: 20 };
      case 'bottom-left':
        return { ...base, bottom: 20, left: 20 };
      case 'bottom-right':
        return { ...base, bottom: 20, right: 20 };
      default:
        return { ...base, top: 20, left: 20 };
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 58) return '#10b981'; // Green
    if (fps >= 50) return '#f59e0b'; // Yellow
    if (fps >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getPerformanceStatus = (fps: number) => {
    if (fps >= 58) return 'Excellent';
    if (fps >= 50) return 'Good';
    if (fps >= 40) return 'Fair';
    return 'Poor';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={getPositionStyles()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: minimal ? '6px' : '12px',
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>
              {minimal ? 'Perf' : 'Performance Dashboard'}
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {!minimal && (
                <button
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  style={{
                    background: isMonitoring ? '#ef4444' : '#10b981',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {isMonitoring ? 'Stop' : 'Start'}
                </button>
              )}
              <button
                onClick={() => setIsVisible(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0 4px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Main Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: minimal ? '1fr' : '1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ color: '#d1d5db' }}>FPS: </span>
                <span style={{ color: getFPSColor(stats.fps), fontWeight: 'bold' }}>
                  {stats.fps}
                </span>
              </div>
              
              {!minimal && (
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#d1d5db' }}>Frame: </span>
                  <span style={{ color: '#f3f4f6' }}>
                    {stats.frameTime.toFixed(1)}ms
                  </span>
                </div>
              )}
            </div>

            {!minimal && (
              <div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#d1d5db' }}>Queue: </span>
                  <span style={{ color: stats.schedulerStats.queueLength > 5 ? '#f59e0b' : '#10b981' }}>
                    {stats.schedulerStats.queueLength}
                  </span>
                </div>
                
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#d1d5db' }}>Threshold: </span>
                  <span style={{ color: '#f3f4f6' }}>
                    {stats.schedulerStats.adaptiveThreshold.toFixed(1)}ms
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Memory Usage */}
          {!minimal && stats.memoryUsage && (
            <div style={{ marginTop: '8px', fontSize: '10px' }}>
              <div style={{ color: '#9ca3af', marginBottom: '2px' }}>Memory Usage:</div>
              <div style={{ color: '#d1d5db' }}>
                {formatBytes(stats.memoryUsage.usedJSSize || 0)} / {formatBytes(stats.memoryUsage.totalJSSize || 0)}
              </div>
            </div>
          )}

          {/* Performance Status */}
          <div
            style={{
              marginTop: minimal ? '6px' : '12px',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor:
                stats.fps >= 58
                  ? 'rgba(16, 185, 129, 0.2)'
                  : stats.fps >= 50
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${
                stats.fps >= 58
                  ? 'rgba(16, 185, 129, 0.3)'
                  : stats.fps >= 50
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(239, 68, 68, 0.3)'
              }`,
              textAlign: 'center' as const,
              fontSize: '10px',
            }}
          >
            {getPerformanceStatus(stats.fps)} Performance
          </div>

          {/* FPS Chart */}
          {!minimal && showChart && chartDataRef.current.length > 1 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}>
                FPS History:
              </div>
              <div
                style={{
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'end',
                  gap: '1px',
                }}
              >
                {chartDataRef.current.slice(-30).map((fps, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      backgroundColor: getFPSColor(fps),
                      height: `${Math.max(2, (fps / 60) * 100)}%`,
                      minHeight: '2px',
                      borderRadius: '1px',
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && !minimal && (
            <div style={{ marginTop: '8px', fontSize: '9px', color: '#6b7280' }}>
              Adaptive Threshold: {stats.schedulerStats.adaptiveThreshold.toFixed(1)}ms |
              Est. FPS: {stats.schedulerStats.estimatedFPS}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PerformanceDashboard;