# Enhancement: Automatic Step Timers in Cook Mode

## Status
🔴 Open

## Priority
High

## Description
Automatically detect time durations mentioned in recipe steps and provide interactive timers directly in the "Cook this recipe" interface. This eliminates the need for users to manually set external timers and creates a more seamless cooking experience.

## Current Implementation
Users likely need to manually track cooking times using external devices or apps when following recipes in cook mode. Recipe steps may mention times (e.g., "Cook for 15 minutes") but these are just text without interactive functionality.

## Required Changes

### 1. Time Detection Algorithm

**Pattern Matching:**
Detect time references in recipe step text:
```typescript
const timePatterns = [
  /(\d+)\s*(minute|min|minutes|mins)/i,
  /(\d+)\s*(second|sec|seconds|secs)/i,
  /(\d+)\s*(hour|hr|hours|hrs)/i,
  /(\d+)-(\d+)\s*(minute|min|minutes|mins)/i, // ranges
  /(\d+)\s*to\s*(\d+)\s*(minute|min|minutes|mins)/i,
  /(\d+)h\s*(\d+)m/i, // 1h 30m format
  /(\d+):(\d+)/i, // 15:30 format
];
```

**Examples to detect:**
- "Bake for 25 minutes"
- "Simmer for 1-2 hours"
- "Cook for 3-5 mins"
- "Rest for 10 seconds"
- "Marinate for 2 hours"
- "Let sit 15-20 minutes"

**Edge Cases:**
- "Cook until done" (no specific time)
- "Refrigerate overnight" (convert to hours or skip)
- Multiple times in one step: "Cook 5 minutes, then add and cook 10 more minutes"

### 2. Timer Component

**Timer UI:**
```
Step 4: Simmer the sauce for 15 minutes, stirring occasionally
┌────────────────────────────────────────────┐
│  ⏱️  15:00                                  │
│  ▶️  Start Timer  |  ⏸️  Pause  |  🔄 Reset │
└────────────────────────────────────────────┘
```

**Active Timer:**
```
Step 4: Simmer the sauce for 15 minutes, stirring occasionally
┌────────────────────────────────────────────┐
│  ⏱️  12:34  [RUNNING]                       │
│  ⏸️  Pause  |  🔄 Reset  |  ➕ Add Time     │
└────────────────────────────────────────────┘
```

**Multiple Timers in One Step:**
```
Step 6: Boil for 5 minutes, then reduce heat and simmer 20 minutes
┌────────────────────────────────────────────┐
│  Timer 1: Boil  ⏱️  05:00  ▶️ Start        │
│  Timer 2: Simmer ⏱️ 20:00  ▶️ Start        │
└────────────────────────────────────────────┘
```

**Timer Features:**
- Start/Pause/Resume
- Reset to original duration
- Add time (+1 min, +5 min buttons)
- Visual progress bar
- Sound/notification when complete
- Vibration on mobile (optional)

### 3. Timer State Management

**Client-Side State:**
```typescript
interface RecipeTimer {
  stepNumber: number;
  duration: number; // in seconds
  remaining: number;
  isActive: boolean;
  isPaused: boolean;
  startedAt?: Date;
  completedAt?: Date;
  label?: string; // e.g., "Boil", "Simmer"
}

interface CookingSession {
  recipeId: string;
  activeTimers: RecipeTimer[];
  completedTimers: RecipeTimer[];
}
```

**Persistence:**
- Use localStorage/sessionStorage for current session
- Optional: sync to database for cross-device support
- Restore timers on page reload if cooking session active

### 4. Notifications

**Browser Notifications:**
```typescript
// Request permission on first timer start
if (Notification.permission === 'default') {
  await Notification.requestPermission();
}

// On timer complete
new Notification('Timer Complete!', {
  body: 'Step 4: Sauce is ready',
  icon: '/timer-icon.png',
  badge: '/badge-icon.png'
});
```

**Sound Alerts:**
- Pleasant chime/bell sound when timer completes
- Optional: different sounds for different timer types
- Repeat notification option (every 30 seconds until dismissed)
- Volume control

**Visual Alerts:**
- Flash/pulse the timer display
- Show completion modal
- Highlight the step that's complete
- Badge notification if user on different tab

### 5. Multi-Timer Management

**Concurrent Timers:**
Show active timers for multiple steps:
```
Active Timers
┌────────────────────────────────────────┐
│ Step 3: Marinate  ⏱️  45:23           │
│ Step 5: Boil      ⏱️  12:08           │
│ Step 7: Bake      ⏱️  03:45  [ALERT!]│
└────────────────────────────────────────┘
```

**Timer Overview Panel:**
- Floating widget showing all active timers
- Click to navigate to respective step
- Ability to manage all timers from one place
- Show next timer to complete at top

### 6. User Customization

**Manual Timer Adjustment:**
- Edit detected time before starting
- Add custom timers to steps without detected times
- Save custom timers for future use

**Timer Preferences:**
- Sound/notification preferences
- Auto-start next timer (for sequential steps)
- Default timer behavior
- Timer display format (MM:SS vs descriptive)

### 7. Time Range Handling

**Variable Times:**
When step says "Cook 15-20 minutes":
```
┌────────────────────────────────────────┐
│  ⏱️  Start at: 15 min  ━━━━━━━  20 min│
│  [Set Timer]                           │
│  or                                    │
│  [Use minimum: 15 min]                 │
│  [Use maximum: 20 min]                 │
│  [Use middle: 17 min]                  │
└────────────────────────────────────────┘
```

### 8. Implementation Areas

**Recipe Parser Enhancement:**
- Parse recipe steps on save/import
- Store detected time metadata
- Update detection algorithm as needed

**Cook Mode UI:**
- Integrate timer components into step display
- Add timer management panel
- Implement notification system

**Background Timer Service:**
- Use Web Workers or service workers for accurate timing
- Continue timers even if tab is not active
- Sync timer state across tabs (same recipe)

## Benefits
- ✅ Eliminates need for external timer apps/devices
- ✅ Reduces context switching while cooking
- ✅ Automatically suggests appropriate times from recipe
- ✅ Handles multiple simultaneous timers easily
- ✅ Improves cooking accuracy and results
- ✅ Makes cook mode significantly more valuable
- ✅ Better user experience for timed recipes
- ✅ Can send notifications when user isn't looking at screen

## Risks
- ⚠️ Time detection may miss some formats or have false positives
- ⚠️ Browser notification permission may be denied
- ⚠️ Timers may not be accurate if browser throttles background tabs
- ⚠️ Sound alerts could be disruptive in some environments
- ⚠️ Multiple timers could be confusing for complex recipes
- ⚠️ Battery drain on mobile devices with active timers
- ⚠️ Time zones and clock changes could affect long timers

## Testing Checklist
After implementation, verify:
- [ ] Common time formats are detected correctly
- [ ] Timers start, pause, resume, and reset properly
- [ ] Timer countdown is accurate (test with 1 min timer)
- [ ] Sound notification plays on timer completion
- [ ] Browser notification appears (when permitted)
- [ ] Visual alerts display correctly
- [ ] Multiple simultaneous timers work without conflicts
- [ ] Timer state persists on page reload (if implemented)
- [ ] Timer continues in background when tab not active
- [ ] Add time buttons work correctly
- [ ] Manual time editing works
- [ ] Time ranges present options correctly
- [ ] Edge cases handled (0 seconds, very long times, etc.)
- [ ] Mobile notifications and vibration work
- [ ] Timer works across different browsers
- [ ] No false positives in time detection
- [ ] Accessibility features work (keyboard control, screen readers)
- [ ] Performance acceptable with many timers

## References
- "Cook this recipe" feature implementation
- Recipe step display components
- Browser Notification API documentation
- Web Workers / Service Workers for background timing
- Audio API for sound alerts

## Notes
- Consider progressive enhancement (basic timer without notifications if permission denied)
- May want to add voice announcements for hands-free cooking
- Could integrate with smart home devices (Alexa, Google Home)
- Timer history could inform recipe improvements (if users always add time)
- Consider adding a "kitchen mode" that keeps screen awake during cooking
- Add quick actions: "Add 1 minute" common for checking doneness
- Could suggest timer based on previous cooking sessions (ML enhancement)
- Integration with recipe notes (#005) to log timer adjustments
- Consider adding visual cues for different timer stages (25%, 50%, 75%, 90%)
- May want to show total remaining cooking time across all steps
- Alarm snooze functionality for checking food (e.g., +2 min snooze)
- Picture-in-picture mode for timer when navigating away from recipe
