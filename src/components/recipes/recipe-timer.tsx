'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Plus, Bell, BellOff } from 'lucide-react';
import { formatTimerDisplay } from '@/lib/recipe-timer';
import { cn } from '@/lib/utils';

export interface RecipeTimerProps {
  duration: number; // in seconds
  label?: string;
  onComplete?: () => void;
  autoStart?: boolean;
  stepNumber?: number;
  isRange?: boolean;
  minDuration?: number;
  maxDuration?: number;
}

export function RecipeTimer({
  duration: initialDuration,
  label,
  onComplete,
  autoStart = false,
  stepNumber,
  isRange = false,
  minDuration,
  maxDuration,
}: RecipeTimerProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [remaining, setRemaining] = useState(initialDuration);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(initialDuration);

  // Initialize audio element (we'll use a simple beep sound via Web Audio API)
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle timer completion
  const handleComplete = useCallback(() => {
    setIsComplete(true);
    setIsActive(false);

    // Play notification sound if enabled
    if (soundEnabled) {
      playNotificationSound();
    }

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: label ? `${label} - Step ${stepNumber !== undefined ? stepNumber + 1 : ''}` : 'Recipe timer finished',
        icon: '/icon-192.png',
        tag: `timer-${stepNumber}`,
      });
    }

    if (onComplete) {
      onComplete();
    }
  }, [soundEnabled, label, stepNumber, onComplete]);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && !isPaused && remaining > 0) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
        const newRemaining = Math.max(0, pausedTimeRef.current - elapsed);

        setRemaining(newRemaining);

        if (newRemaining <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          handleComplete();
        }
      }, 100); // Update every 100ms for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isActive, isPaused, remaining, handleComplete]);

  // Play notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setIsComplete(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = remaining;
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsActive(false);
    pausedTimeRef.current = remaining;
    startTimeRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsComplete(false);
    setRemaining(duration);
    pausedTimeRef.current = duration;
    startTimeRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleAddTime = (seconds: number) => {
    const newRemaining = remaining + seconds;
    const newDuration = duration + seconds;
    setRemaining(newRemaining);
    setDuration(newDuration);
    pausedTimeRef.current = newRemaining;
  };

  const handleSetDuration = (newDuration: number) => {
    setDuration(newDuration);
    setRemaining(newDuration);
    pausedTimeRef.current = newDuration;
    handleReset();
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const progress = ((duration - remaining) / duration) * 100;
  const isRunning = isActive && !isPaused;

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 transition-all',
        isComplete
          ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
          : isRunning
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
          : 'border-[#e8dcc8] bg-white dark:border-slate-700 dark:bg-slate-900'
      )}
    >
      {/* Timer display */}
      <div className="mb-3 text-center">
        {label && (
          <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            {label}
          </div>
        )}
        <div
          className={cn(
            'font-mono text-3xl font-bold',
            isComplete
              ? 'text-green-600 dark:text-green-400'
              : isRunning
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-[#2d5016] dark:text-slate-200'
          )}
        >
          {formatTimerDisplay(remaining)}
        </div>
        {isRange && (
          <div className="mt-1 text-xs text-slate-500">
            Range: {formatTimerDisplay(minDuration || 0)} -{' '}
            {formatTimerDisplay(maxDuration || 0)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={cn(
            'h-full transition-all duration-300',
            isComplete
              ? 'bg-green-500'
              : isRunning
              ? 'bg-blue-500'
              : 'bg-[#2d5016]'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {!isRunning && !isComplete && (
          <Button
            size="sm"
            onClick={() => {
              handleStart();
              requestNotificationPermission();
            }}
            className="bg-[#2d5016] hover:bg-[#3d6b1f]"
          >
            <Play className="mr-1 h-4 w-4" />
            Start
          </Button>
        )}

        {isRunning && (
          <Button size="sm" onClick={handlePause} variant="outline">
            <Pause className="mr-1 h-4 w-4" />
            Pause
          </Button>
        )}

        <Button size="sm" onClick={handleReset} variant="outline">
          <RotateCcw className="mr-1 h-4 w-4" />
          Reset
        </Button>

        <Button
          size="sm"
          onClick={() => handleAddTime(60)}
          variant="outline"
          title="Add 1 minute"
        >
          <Plus className="mr-1 h-4 w-4" />
          1m
        </Button>

        <Button
          size="sm"
          onClick={() => handleAddTime(300)}
          variant="outline"
          title="Add 5 minutes"
        >
          <Plus className="mr-1 h-4 w-4" />
          5m
        </Button>

        <Button
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          variant="ghost"
          title={soundEnabled ? 'Disable sound' : 'Enable sound'}
        >
          {soundEnabled ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Range options */}
      {isRange && !isRunning && !isComplete && minDuration && maxDuration && (
        <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSetDuration(minDuration)}
            className="flex-1 text-xs"
          >
            Min: {formatTimerDisplay(minDuration)}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSetDuration(maxDuration)}
            className="flex-1 text-xs"
          >
            Max: {formatTimerDisplay(maxDuration)}
          </Button>
        </div>
      )}

      {isComplete && (
        <div className="mt-2 text-center text-sm font-medium text-green-600 dark:text-green-400">
          ✓ Timer Complete!
        </div>
      )}
    </div>
  );
}
