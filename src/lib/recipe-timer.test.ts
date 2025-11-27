import { describe, it, expect } from 'vitest';
import {
  detectTimersInStep,
  formatDuration,
  formatTimerDisplay,
  parseTimeString,
} from './recipe-timer';

describe('recipe-timer', () => {
  describe('detectTimersInStep', () => {
    it('should detect range timer without duplicating single timer', () => {
      const step =
        'Stir in cream cheese and ranch dressing. Cook and stir until well blended and warm, 3 to 5 minutes.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].isRange).toBe(true);
      expect(result.timers[0].minDuration).toBe(180);
      expect(result.timers[0].maxDuration).toBe(300);
      expect(result.timers[0].duration).toBe(240);
    });

    it('should detect multiple non-overlapping timers', () => {
      const step = 'Bake for 15 minutes, then cook for 30 minutes.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(2);
      expect(result.timers[0].duration).toBe(900);
      expect(result.timers[1].duration).toBe(1800);
    });

    it('should handle compound time format', () => {
      const step = 'Simmer for 1h 30m until tender.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].duration).toBe(5400);
      expect(result.timers[0].isRange).toBe(false);
    });

    it('should detect clock format', () => {
      const step = 'Set timer for 1:30';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].duration).toBe(90);
    });

    it('should detect range with hours', () => {
      const step = 'Bake for 1 to 2 hours until golden.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].isRange).toBe(true);
      expect(result.timers[0].minDuration).toBe(3600);
      expect(result.timers[0].maxDuration).toBe(7200);
      expect(result.timers[0].unit).toBe('hours');
    });

    it('should detect range with seconds', () => {
      const step = 'Boil for 30 to 45 seconds.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].isRange).toBe(true);
      expect(result.timers[0].minDuration).toBe(30);
      expect(result.timers[0].maxDuration).toBe(45);
      expect(result.timers[0].unit).toBe('seconds');
    });

    it('should handle range with dash separator', () => {
      const step = 'Cook for 10-15 minutes.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].isRange).toBe(true);
      expect(result.timers[0].minDuration).toBe(600);
      expect(result.timers[0].maxDuration).toBe(900);
    });

    it('should detect single time with different units', () => {
      const stepMinutes = 'Cook for 5 minutes.';
      const resultMinutes = detectTimersInStep(stepMinutes, 0);
      expect(resultMinutes.timers[0].unit).toBe('minutes');
      expect(resultMinutes.timers[0].duration).toBe(300);

      const stepHours = 'Bake for 2 hours.';
      const resultHours = detectTimersInStep(stepHours, 0);
      expect(resultHours.timers[0].unit).toBe('hours');
      expect(resultHours.timers[0].duration).toBe(7200);

      const stepSeconds = 'Boil for 30 seconds.';
      const resultSeconds = detectTimersInStep(stepSeconds, 0);
      expect(resultSeconds.timers[0].unit).toBe('seconds');
      expect(resultSeconds.timers[0].duration).toBe(30);
    });

    it('should handle abbreviated time units', () => {
      const step = 'Cook for 15 min, then 1 hr more.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(2);
      expect(result.timers[0].duration).toBe(900); // 15 min
      expect(result.timers[1].duration).toBe(3600); // 1 hr
    });

    it('should return empty array when no timers found', () => {
      const step = 'Mix ingredients together.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(0);
    });

    it('should handle compound format without spaces', () => {
      const step = 'Simmer for 2h30m.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].duration).toBe(9000); // 2.5 hours
    });

    it('should sort timers by position', () => {
      const step = 'First wait 30 minutes, then wait 10 seconds.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(2);
      expect(result.timers[0].startIndex).toBeLessThan(
        result.timers[1].startIndex
      );
    });

    it('should detect multiple clock format times', () => {
      const step = 'First timer 2:30, then timer 1:45';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(2);
      expect(result.timers[0].duration).toBe(150); // 2 minutes 30 seconds
      expect(result.timers[1].duration).toBe(105); // 1 minute 45 seconds
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5s');
      expect(formatDuration(60)).toBe('1m');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(3665)).toBe('1h 1m');
      expect(formatDuration(3600)).toBe('1h');
    });

    it('should format hours only', () => {
      expect(formatDuration(7200)).toBe('2h');
    });
  });

  describe('formatTimerDisplay', () => {
    it('should format as MM:SS', () => {
      expect(formatTimerDisplay(125)).toBe('02:05');
      expect(formatTimerDisplay(59)).toBe('00:59');
    });

    it('should format as HH:MM:SS', () => {
      expect(formatTimerDisplay(3665)).toBe('01:01:05');
      expect(formatTimerDisplay(7200)).toBe('02:00:00');
    });
  });

  describe('parseTimeString', () => {
    it('should parse clock format MM:SS', () => {
      expect(parseTimeString('2:30')).toBe(150);
      expect(parseTimeString('0:45')).toBe(45);
    });

    it('should parse clock format HH:MM:SS', () => {
      expect(parseTimeString('1:30:45')).toBe(5445);
      expect(parseTimeString('2:0:0')).toBe(7200);
    });

    it('should parse natural language', () => {
      expect(parseTimeString('5 minutes')).toBe(300);
      expect(parseTimeString('2 hours')).toBe(7200);
      expect(parseTimeString('30 seconds')).toBe(30);
    });

    it('should parse abbreviated units', () => {
      expect(parseTimeString('5 min')).toBe(300);
      expect(parseTimeString('2 hr')).toBe(7200);
      expect(parseTimeString('30 sec')).toBe(30);
    });

    it('should return null for invalid input', () => {
      expect(parseTimeString('invalid')).toBeNull();
      expect(parseTimeString('abc minutes')).toBeNull();
    });

    it('should be case insensitive', () => {
      expect(parseTimeString('5 MINUTES')).toBe(300);
      expect(parseTimeString('2 Hours')).toBe(7200);
    });
  });
});
