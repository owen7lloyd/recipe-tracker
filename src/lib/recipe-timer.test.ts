import { describe, it, expect } from 'vitest';
import { detectTimersInStep } from './recipe-timer';

describe('recipe-timer', () => {
  describe('detectTimersInStep', () => {
    it('should detect range timer without duplicating single timer', () => {
      const step =
        'Stir in cream cheese and ranch dressing. Cook and stir until well blended and warm, 3 to 5 minutes.';
      const result = detectTimersInStep(step, 0);

      // Should have exactly 1 timer, not 2
      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].isRange).toBe(true);
      expect(result.timers[0].minDuration).toBe(180); // 3 minutes in seconds
      expect(result.timers[0].maxDuration).toBe(300); // 5 minutes in seconds
      expect(result.timers[0].duration).toBe(240); // Average (3+5)/2 = 4 minutes in seconds
    });

    it('should detect multiple non-overlapping timers', () => {
      const step = 'Bake for 15 minutes, then cook for 30 minutes.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(2);
      expect(result.timers[0].duration).toBe(900); // 15 minutes
      expect(result.timers[1].duration).toBe(1800); // 30 minutes
    });

    it('should handle compound time format', () => {
      const step = 'Simmer for 1h 30m until tender.';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].duration).toBe(5400); // 1.5 hours = 5400 seconds
      expect(result.timers[0].isRange).toBe(false);
    });

    it('should detect clock format', () => {
      const step = 'Set timer for 1:30';
      const result = detectTimersInStep(step, 0);

      expect(result.timers).toHaveLength(1);
      expect(result.timers[0].duration).toBe(90); // 1 minute 30 seconds
    });
  });
});
