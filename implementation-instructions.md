# Smart Unit Selector Redesign - Implementation Instructions

## Overview
Redesign the `SmartUnitSelector` component to use a combo/split button design where the dropdown and toggle button are unified into a single component. The toggle button will use icons (Maximize2/Minimize2 from lucide-react) instead of text labels.

## Current Issues to Fix
1. Toggle button overflow in constrained layouts
2. Confusing button text (shows next action, not current state)
3. No visual indication when button is disabled/locked
4. Takes too much horizontal space

## New Design Specification

### Visual Structure
```
┌─────────────────────────────────┐
│  Unit Dropdown    │  [Icon]     │
│  (flex-1)         │  (toggle)   │
└─────────────────────────────────┘
```

The dropdown and toggle button should be visually unified with:
- Single outer border around both elements
- Dividing line between dropdown and button
- Rounded corners on the outer container
- No gap between dropdown and button

### Component Behavior

#### States & Icons
1. **Suggested mode (collapsed)**: Show Maximize2 icon (expand arrows)
2. **All units mode (expanded)**: Show Minimize2 icon (collapse arrows)
3. **Locked mode**: Show Minimize2 icon, disabled state styling

#### Toggle Logic
- When showing suggested units → button shows Maximize2 icon → clicking expands to all units
- When showing all units → button shows Minimize2 icon → clicking collapses to suggested
- When non-suggested unit is selected → auto-expand to all units → button disabled with Minimize2 icon

### Implementation Details

#### File to Modify
`src/components/ui/smart-unit-selector.tsx`

#### Required Changes

1. **Import Icons**
```typescript
import { Maximize2, Minimize2 } from 'lucide-react';
```

2. **Replace the current wrapper div structure**

Current structure:
```tsx
<div className={`flex gap-2 ${className}`}>
  <select>...</select>
  <button>...</button>
</div>
```

New structure:
```tsx
<div className={`flex h-10 rounded-md border border-slate-200 overflow-hidden dark:border-slate-800 ${className}`}>
  <select className="flex-1 border-0 bg-white px-3 py-2 text-sm ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:focus-visible:ring-slate-300">
    {/* existing options */}
  </select>
  
  {!disabled && (
    <button
      type="button"
      onClick={() => {
        // Only allow toggling if not locked
        if (!(shouldShowAll && value && !isValueInSuggested)) {
          setShowAll(!showAll);
        }
      }}
      disabled={shouldShowAll && value && !isValueInSuggested}
      title={
        shouldShowAll && value && !isValueInSuggested
          ? "Locked to all units (selected unit not in suggested list)"
          : shouldShowAll
          ? "Show suggested units only"
          : "Show all units"
      }
      className={`flex w-10 shrink-0 items-center justify-center border-l transition-colors ${
        shouldShowAll && value && !isValueInSuggested
          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {shouldShowAll ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </button>
  )}
</div>
```

3. **Key Styling Changes for Select Element**
   - Remove: `h-10`, `rounded-md`, `border`, individual styling
   - Add: `border-0`, `ring-offset-0`, `focus-visible:ring-inset`
   - Keep: All other classes for focus states, disabled states, dark mode

4. **Key Styling Changes for Button**
   - Remove: Individual `rounded-md`, `border` on all sides
   - Add: `border-l` (only left border), `w-10` (fixed width)
   - The button should have three visual states:
     - Normal: white background, slate text, hover effects
     - Disabled: slate-100 background, slate-400 text, no hover
     - Dark mode variants for both

5. **Behavior Logic**
   - Button should be functionally disabled when `shouldShowAll && value && !isValueInSuggested`
   - Icon should reflect current state: Minimize2 when expanded, Maximize2 when collapsed
   - Tooltip should explain current state and action

### Testing Checklist

After implementation, verify:

- [ ] Component fits in `grid-cols-12` recipe layout (col-span-3)
- [ ] Component fits in `grid-cols-5` pantry layout (col-span-3)
- [ ] Component fits in `grid-cols-12` grocery list layout (col-span-5)
- [ ] No overflow or visual glitches in any layout
- [ ] Dropdown and button appear as single unified component
- [ ] Border and corner radius are correct
- [ ] Icons are centered and sized appropriately (h-4 w-4)
- [ ] Clicking Maximize2 icon expands to show all units
- [ ] Clicking Minimize2 icon collapses to show suggested units
- [ ] When non-suggested unit is selected:
  - Dropdown auto-expands to all units
  - Button shows Minimize2 icon
  - Button appears visually disabled
  - Button doesn't respond to clicks
  - Tooltip explains locked state
- [ ] Focus states work correctly (ring should be inset within the border)
- [ ] Dark mode styling works correctly
- [ ] Disabled state (whole component) works correctly
- [ ] Tooltips are informative and accurate

### Edge Cases to Handle

1. **When disabled prop is true**: Don't render the toggle button at all
2. **Initial render with no value**: Show Maximize2 icon in suggested mode
3. **Value changes from suggested to non-suggested**: Auto-expand and lock button
4. **Value changes from non-suggested to suggested**: Allow toggling again
5. **Keyboard navigation**: Ensure tab order and focus states work naturally

### Visual Design Goals

The final result should:
- Look like a single, unified component (not two separate elements)
- Take minimal horizontal space (dropdown + 40px button)
- Have clear visual feedback for all states
- Use universally understood expand/collapse icons
- Match the existing Tailwind design system
- Work seamlessly in all three integration contexts

## Additional Notes

- The outer container div now handles the border and rounded corners
- The select element should have `border-0` to prevent double borders
- The button should only have `border-l` to create the divider
- Use `overflow-hidden` on container to properly clip rounded corners
- The `focus-visible:ring-inset` ensures the focus ring appears inside the component boundary
- Keep all existing dropdown option rendering logic unchanged
- Only the wrapper structure and button content/styling need to change

## Files That Will Be Affected

Primary:
- `src/components/ui/smart-unit-selector.tsx`

No changes needed to:
- `src/components/recipes/ingredient-input.tsx`
- `src/components/pantry/add-pantry-item-form.tsx`
- `src/components/grocery-lists/grocery-list-item.tsx`
- `src/lib/constants/units.ts`

The component's props and API remain identical, so no integration changes are required.
