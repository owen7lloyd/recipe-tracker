'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Plus, Bell, BellOff } from 'lucide-react';
import { formatTimerDisplay } from '@/lib/recipe-timer';
import { cn } from '@/lib/utils';

export interface TimerState {
  duration: number;
  remaining: number;
  isActive: boolean;
  isPaused: boolean;
  isComplete: boolean;
  soundEnabled: boolean;
  startTime: number | null;
  pausedTime: number;
}

export interface RecipeTimerProps {
  duration: number; // in seconds
  label?: string;
  onComplete?: () => void;
  autoStart?: boolean;
  stepNumber?: number;
  isRange?: boolean;
  minDuration?: number;
  maxDuration?: number;
  timerId?: string; // Unique identifier for controlled state
  timerState?: TimerState; // External state (controlled)
  onStateChange?: (timerId: string, state: TimerState) => void; // Callback for state changes
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
  timerId,
  timerState: externalState,
  onStateChange,
}: RecipeTimerProps) {
  // Use external state if provided (controlled), otherwise use internal state (uncontrolled)
  const isControlled = !!timerId && !!externalState && !!onStateChange;

  const [internalState, setInternalState] = useState<TimerState>({
    duration: initialDuration,
    remaining: initialDuration,
    isActive: autoStart,
    isPaused: false,
    isComplete: false,
    soundEnabled: true,
    startTime: null,
    pausedTime: initialDuration,
  });

  const state = isControlled ? externalState : internalState;
  const setState = isControlled
    ? (newState: TimerState | ((prev: TimerState) => TimerState)) => {
        const updatedState = typeof newState === 'function' ? newState(state) : newState;
        onStateChange(timerId, updatedState);
      }
    : setInternalState;

  const { duration, remaining, isActive, isPaused, isComplete, soundEnabled, startTime, pausedTime } = state;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    setState(prev => ({ ...prev, isComplete: true, isActive: false }));

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
  }, [soundEnabled, label, stepNumber, onComplete, setState]);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && !isPaused && remaining > 0) {
      const currentStartTime = startTime || Date.now();
      if (!startTime) {
        setState(prev => ({ ...prev, startTime: currentStartTime }));
      }

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentStartTime) / 1000);
        const newRemaining = Math.max(0, pausedTime - elapsed);

        setState(prev => ({ ...prev, remaining: newRemaining }));

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
  }, [isActive, isPaused, remaining, handleComplete, startTime, pausedTime, setState]);

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
    const now = Date.now();
    setState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      isComplete: false,
      startTime: now,
      pausedTime: prev.remaining,
    }));
  };

  const handlePause = () => {
    setState(prev => ({
      ...prev,
      isPaused: true,
      isActive: false,
      pausedTime: prev.remaining,
      startTime: null,
    }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      isComplete: false,
      remaining: prev.duration,
      pausedTime: prev.duration,
      startTime: null,
    }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleAddTime = (seconds: number) => {
    setState(prev => ({
      ...prev,
      remaining: prev.remaining + seconds,
      duration: prev.duration + seconds,
      pausedTime: prev.remaining + seconds,
    }));
  };

  const handleSetDuration = (newDuration: number) => {
    setState(prev => ({
      ...prev,
      duration: newDuration,
      remaining: newDuration,
      pausedTime: newDuration,
      isActive: false,
      isPaused: false,
      isComplete: false,
      startTime: null,
    }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleToggleSound = () => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
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
          onClick={handleToggleSound}
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
