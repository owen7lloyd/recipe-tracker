# Enhancement: Recipe Notes in Cook Mode

## Status
🔴 Open

## Priority
Low

## Description
Allow users to add notes and observations while cooking a recipe using the "Cook this recipe" feature. This enables users to capture improvements, substitutions, timing adjustments, and personal preferences in real-time during the cooking process.

## Current Implementation
The "Cook this recipe" feature likely provides a step-by-step cooking interface, but may not include functionality for users to add personal notes or modifications while actively cooking.

## Required Changes

### 1. Database Schema

**Recipe Session Notes:**
```sql
CREATE TABLE recipe_notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  recipe_id UUID REFERENCES recipes(id),
  note_text TEXT NOT NULL,
  step_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  session_id UUID REFERENCES recipe_cook_history(id),
  INDEX idx_user_recipe (user_id, recipe_id)
);
```

**Fields:**
- `note_text`: The actual note content
- `step_number`: Optional link to specific recipe step
- `session_id`: Link to cooking session (if tracking feature #004 is implemented)

### 2. UI Components in Cook Mode

**Note Input Interface:**

**Per-Step Notes:**
```
Step 3: Heat oil in a large pan over medium heat
┌─────────────────────────────────────────┐
│ [Timer: 2:00] [✓ Complete]             │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📝 Add a note for this step...          │
│ ┌─────────────────────────────────────┐ │
│ │ Medium-high worked better for my   │ │
│ │ stove. Took 3 min instead of 2.    │ │
│ └─────────────────────────────────────┘ │
│ [Save Note]                             │
└─────────────────────────────────────────┘

Previous notes on this step:
• "Used avocado oil instead" - 2 weeks ago
• "Needs more heat" - 1 month ago
```

**General Recipe Notes:**
```
[Add General Note] button at top/bottom
┌─────────────────────────────────────────┐
│ 📝 General Notes                        │
│ ┌─────────────────────────────────────┐ │
│ │ Family loved this! Will double the │ │
│ │ garlic next time. Served with rice │ │
│ │ and it was perfect.                 │ │
│ └─────────────────────────────────────┘ │
│ [Save Note]                             │
└─────────────────────────────────────────┘
```

**Note Display Options:**
- Inline with each step (collapsed/expandable)
- Sidebar panel showing all notes
- Floating note button that opens modal

### 3. Note Features

**Quick Note Templates:**
Predefined common notes users can quickly add:
- "Needs more time"
- "Reduce heat"
- "Increase seasoning"
- "Great as written"
- "Substituted [ingredient]"
- Custom text input

**Voice Input (Optional):**
- Allow voice-to-text for hands-free note taking while cooking
- Particularly useful when hands are messy

**Note Categories/Tags:**
- Timing adjustments
- Ingredient substitutions
- Serving suggestions
- Equipment notes
- Success/failure markers

### 4. Note Management

**Viewing Notes:**
- Show notes in cook mode
- Display on recipe detail page
- Filter by date/session
- Search through notes

**Editing Notes:**
- Edit existing notes
- Delete notes
- Mark notes as "still relevant" vs "outdated"

**Note Aggregation:**
- Show most common adjustments across all cook sessions
- Highlight patterns (e.g., "You've added extra garlic 3 times")
- Suggest permanent recipe modifications based on notes

### 5. API Endpoints

**Create Note:**
- `POST /api/recipes/:recipeId/notes`
- Body: `{ noteText, stepNumber?, sessionId? }`

**Get Recipe Notes:**
- `GET /api/recipes/:recipeId/notes`
- Returns all notes for recipe, optionally filtered by step

**Update Note:**
- `PATCH /api/notes/:noteId`
- Body: `{ noteText }`

**Delete Note:**
- `DELETE /api/notes/:noteId`

### 6. Integration Points

**Cook Mode:**
- Add note input UI to each step
- Provide quick-access note button
- Auto-save notes to prevent loss

**Recipe Detail Page:**
- Show "Your Notes" section
- Display historical notes and modifications
- Option to apply notes to recipe permanently

**Recipe History (if #004 implemented):**
- Link notes to specific cooking sessions
- Show timeline of notes and iterations

**Recipe Sharing:**
- Option to include notes when sharing recipe
- Privacy control (keep notes private by default)

## Benefits
- ✅ Helps users improve recipes over time
- ✅ Captures real-time observations while cooking
- ✅ Creates personalized recipe variations
- ✅ Reduces need to remember changes for next time
- ✅ Provides context for recipe ratings
- ✅ Enables iterative recipe refinement
- ✅ Valuable historical record of cooking experiments

## Risks
- ⚠️ Users may not want to interact with device while cooking
- ⚠️ Potential for clutter if too many notes accumulate
- ⚠️ May be challenging to use with messy hands
- ⚠️ Storage requirements for note text
- ⚠️ Could overcomplicate the cooking interface

## Testing Checklist
After implementation, verify:
- [ ] Notes can be added during cook mode
- [ ] Notes save correctly to database
- [ ] Step-specific notes associate with correct step number
- [ ] General notes save without step association
- [ ] Notes display in cook mode for future cooking sessions
- [ ] Notes appear on recipe detail page
- [ ] Note editing and deletion work properly
- [ ] Voice input works (if implemented)
- [ ] Quick note templates insert correctly
- [ ] Notes don't interfere with cooking workflow
- [ ] Auto-save prevents data loss
- [ ] Privacy settings work (notes not shared by default)
- [ ] Mobile interface is usable while cooking
- [ ] Keyboard shortcuts work for quick note taking
- [ ] Notes integrate with recipe history (if implemented)

## References
- "Cook this recipe" feature implementation
- Recipe detail page components
- Recipe tracking feature (#004)
- Database schema for recipes and cooking sessions

## Notes
- Start with simple text notes, expand to structured data later
- Consider adding photos to notes (e.g., "This is how it should look")
- Could allow tagging other users in shared recipes
- Integration with recipe versioning (save notes as new recipe version)
- Consider adding AI suggestions based on note patterns
- May want to implement note import/export for backup
- Keep UI minimal during active cooking to avoid distraction
- Consider read-only mode where notes from past sessions are visible but new notes require explicit action
- Could add collaborative notes for shared/family recipes
