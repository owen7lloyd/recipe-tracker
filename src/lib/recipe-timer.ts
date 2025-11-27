/**
 * Recipe Timer Detection Utility
 * Automatically detects time durations mentioned in recipe step text
 * and provides utilities for timer management
 */

export interface DetectedTimer {
  duration: number; // Duration in seconds
  unit: 'seconds' | 'minutes' | 'hours';
  originalText: string; // The matched text (e.g., "15 minutes")
  startIndex: number; // Position in the text where match was found
  endIndex: number;
  isRange: boolean; // True if it's a range (e.g., "15-20 minutes")
  minDuration?: number; // For ranges
  maxDuration?: number; // For ranges
  label?: string; // Optional label extracted from context
}

export interface StepTimer {
  stepNumber: number;
  stepText: string;
  timers: DetectedTimer[];
}

/**
 * Time unit conversion factors to seconds
 */
const TIME_UNITS = {
  second: 1,
  seconds: 1,
  sec: 1,
  secs: 1,
  s: 1,
  minute: 60,
  minutes: 60,
  min: 60,
  mins: 60,
  m: 60,
  hour: 3600,
  hours: 3600,
  hr: 3600,
  hrs: 3600,
  h: 3600,
} as const;

/**
 * Regular expressions for detecting time patterns
 */
const TIME_PATTERNS = [
  // Ranges: "15-20 minutes", "1-2 hours", "3 to 5 mins"
  {
    regex:
      /(\d+)\s*(?:-|to)\s*(\d+)\s*(minute|min|minutes|mins|second|sec|seconds|secs|hour|hr|hours|hrs)/gi,
    type: 'range' as const,
  },
  // Time with format: "1h 30m", "2h30m"
  {
    regex: /(\d+)\s*h(?:our)?s?\s*(\d+)\s*m(?:in(?:ute)?s?)?/gi,
    type: 'compound' as const,
  },
  // Clock format: "1:30", "0:45"
  {
    regex: /(\d+):(\d+)/g,
    type: 'clock' as const,
  },
  // Single time: "25 minutes", "1 hour", "30 secs"
  {
    regex:
      /(\d+)\s*(minute|min|minutes|mins|second|sec|seconds|secs|hour|hr|hours|hrs)/gi,
    type: 'single' as const,
  },
];

/**
 * Extracts a label/context from the text before a time mention
 * e.g., "Boil for 5 minutes" -> "Boil"
 */
function extractLabel(text: string, startIndex: number): string | undefined {
  // Look for verb or noun before the time
  const beforeText = text
    .substring(Math.max(0, startIndex - 30), startIndex)
    .trim();
  const words = beforeText.split(/\s+/);

  // Get the last 1-2 meaningful words
  const meaningfulWords = words.filter((w) => w.length > 2);
  if (meaningfulWords.length > 0) {
    return meaningfulWords[meaningfulWords.length - 1];
  }

  return undefined;
}

/**
 * Converts a time amount and unit to seconds
 */
function toSeconds(amount: number, unit: string): number {
  const normalizedUnit = unit.toLowerCase() as keyof typeof TIME_UNITS;
  return amount * (TIME_UNITS[normalizedUnit] || 60);
}

/**
 * Detects all timers in a single recipe step text
 */
export function detectTimersInStep(
  stepText: string,
  stepNumber: number
): StepTimer {
  const timers: DetectedTimer[] = [];
  const usedRanges: Array<{ start: number; end: number }> = []; // Track character ranges to avoid overlaps

  /**
   * Checks if a character range overlaps with any already-processed range
   */
  function isOverlapping(start: number, end: number): boolean {
    return usedRanges.some(
      (range) => !(end <= range.start || start >= range.end)
    );
  }

  for (const pattern of TIME_PATTERNS) {
    const matches = stepText.matchAll(pattern.regex);

    for (const match of matches) {
      const startIndex = match.index || 0;
      const endIndex = startIndex + match[0].length;

      // Skip if this match overlaps with already-processed ranges
      if (isOverlapping(startIndex, endIndex)) continue;

      const originalText = match[0];
      const label = extractLabel(stepText, startIndex);

      if (pattern.type === 'range') {
        // Range pattern: "15-20 minutes"
        const min = parseInt(match[1], 10);
        const max = parseInt(match[2], 10);
        const unit = match[3];
        const minSeconds = toSeconds(min, unit);
        const maxSeconds = toSeconds(max, unit);
        const avgDuration = Math.floor((minSeconds + maxSeconds) / 2);

        timers.push({
          duration: avgDuration,
          unit: unit.includes('hour')
            ? 'hours'
            : unit.includes('sec')
              ? 'seconds'
              : 'minutes',
          originalText,
          startIndex,
          endIndex,
          isRange: true,
          minDuration: minSeconds,
          maxDuration: maxSeconds,
          label,
        });
        usedRanges.push({ start: startIndex, end: endIndex });
      } else if (pattern.type === 'compound') {
        // Compound pattern: "1h 30m"
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const duration = hours * 3600 + minutes * 60;

        timers.push({
          duration,
          unit: 'minutes',
          originalText,
          startIndex,
          endIndex,
          isRange: false,
          label,
        });
        usedRanges.push({ start: startIndex, end: endIndex });
      } else if (pattern.type === 'clock') {
        // Clock pattern: "1:30" (assume minutes:seconds)
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const duration = minutes * 60 + seconds;

        // Only consider if reasonable cooking time (< 24 hours)
        if (duration < 86400) {
          timers.push({
            duration,
            unit: 'minutes',
            originalText,
            startIndex,
            endIndex,
            isRange: false,
            label,
          });
          usedRanges.push({ start: startIndex, end: endIndex });
        }
      } else if (pattern.type === 'single') {
        // Single time pattern: "25 minutes"
        const amount = parseInt(match[1], 10);
        const unit = match[2];
        const duration = toSeconds(amount, unit);

        timers.push({
          duration,
          unit: unit.includes('hour')
            ? 'hours'
            : unit.includes('sec')
              ? 'seconds'
              : 'minutes',
          originalText,
          startIndex,
          endIndex,
          isRange: false,
          label,
        });
        usedRanges.push({ start: startIndex, end: endIndex });
      }
    }
  }

  // Sort by position in text
  timers.sort((a, b) => a.startIndex - b.startIndex);

  return {
    stepNumber,
    stepText,
    timers,
  };
}

/**
 * Detects timers in all recipe steps
 */
export function detectAllTimers(instructions: string[]): StepTimer[] {
  return instructions
    .map((instruction, index) => detectTimersInStep(instruction, index))
    .filter((stepTimer) => stepTimer.timers.length > 0);
}

/**
 * Formats duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Formats duration for timer display (MM:SS or HH:MM:SS)
 */
export function formatTimerDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  } else {
    return `${pad(minutes)}:${pad(secs)}`;
  }
}

/**
 * Parses a time string back to seconds (for user input)
 */
export function parseTimeString(timeString: string): number | null {
  // Try clock format first (MM:SS or HH:MM:SS)
  const clockMatch = timeString.match(/^(\d+):(\d+)(?::(\d+))?$/);
  if (clockMatch) {
    const hours = clockMatch[3] ? parseInt(clockMatch[1], 10) : 0;
    const minutes = clockMatch[3]
      ? parseInt(clockMatch[2], 10)
      : parseInt(clockMatch[1], 10);
    const seconds = clockMatch[3]
      ? parseInt(clockMatch[3], 10)
      : parseInt(clockMatch[2], 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Try natural language: "5 minutes", "1 hour"
  const match = timeString.match(
    /(\d+)\s*(second|minute|hour|sec|min|hr|s|m|h)/i
  );
  if (match) {
    return toSeconds(parseInt(match[1], 10), match[2]);
  }

  return null;
}
