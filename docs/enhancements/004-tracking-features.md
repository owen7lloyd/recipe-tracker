# Enhancement: Usage Tracking and Analytics

## Status
🔴 Open

## Priority
Medium

## Description
Provide users with insights into their cooking habits by tracking and displaying statistics about their most used ingredients and most frequently cooked recipes. This feature adds value by helping users understand their preferences, plan better, and discover patterns in their cooking.

## Current Implementation
The application likely tracks recipe creation and basic usage, but does not provide analytics or insights to users about their cooking patterns over time.

## Required Changes

### 1. Database Schema

**Recipe Cook Tracking:**
```sql
CREATE TABLE recipe_cook_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  recipe_id UUID REFERENCES recipes(id),
  cooked_at TIMESTAMP DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  INDEX idx_user_recipe (user_id, recipe_id),
  INDEX idx_cooked_at (cooked_at)
);
```

**Ingredient Usage Tracking:**
```sql
CREATE TABLE ingredient_usage_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ingredient_id UUID REFERENCES ingredients(id),
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  first_used TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, ingredient_id)
);
```

### 2. Tracking Implementation

**Recipe Cook Events:**
- Track when user starts "Cook this recipe" mode
- Record completion of cooking session
- Optional: Track time spent cooking
- Allow users to mark recipes as cooked manually

**Ingredient Usage Events:**
Increment usage when:
- Recipe containing ingredient is cooked
- Ingredient added to grocery list (optional)
- Ingredient used in pantry (optional)

### 3. API Endpoints

**Recipe Statistics:**
- `GET /api/stats/recipes/most-cooked`
  - Query params: `?limit=10&period=all|year|month|week`
  - Returns: Recipe list with cook count and last cooked date

**Ingredient Statistics:**
- `GET /api/stats/ingredients/most-used`
  - Query params: `?limit=10&period=all|year|month|week`
  - Returns: Ingredient list with usage count and frequency

**Overall Statistics:**
- `GET /api/stats/overview`
  - Returns: Total recipes cooked, unique ingredients used, cooking streaks, etc.

**Record Cook Event:**
- `POST /api/recipes/:id/cook`
  - Body: `{ completedAt?, rating?, notes? }`
  - Updates recipe cook history and ingredient usage stats

### 4. UI Components

**Statistics Dashboard:**
Create new page or section: `/dashboard/stats` or `/stats`

**Most Cooked Recipes Section:**
```
Most Cooked Recipes (This Month)
┌──────────────────────────────────────┐
│ 🥘 Chicken Curry          12 times   │
│    Last cooked: 2 days ago           │
├──────────────────────────────────────┤
│ 🍝 Spaghetti Carbonara     8 times   │
│    Last cooked: 1 week ago           │
├──────────────────────────────────────┤
│ 🥗 Caesar Salad            6 times   │
│    Last cooked: 3 days ago           │
└──────────────────────────────────────┘
```

**Most Used Ingredients Section:**
```
Your Top Ingredients (All Time)
┌──────────────────────────────────────┐
│ 🧄 Garlic                  45 recipes │
│ 🧅 Onion                   42 recipes │
│ 🧂 Salt                    40 recipes │
│ 🌶️ Black Pepper            38 recipes │
│ 🫒 Olive Oil               35 recipes │
└──────────────────────────────────────┘
[View All →]
```

**Time Period Selector:**
- All Time
- This Year
- This Month
- This Week

**Additional Stats Cards:**
- Total recipes cooked
- Cooking streak (consecutive days/weeks)
- Favorite cuisine types
- Average recipes per week
- New recipes tried this month

**Visual Enhancements:**
- Charts/graphs for trends over time
- Calendar heatmap of cooking activity
- Progress towards cooking goals (if implemented)

### 5. Integration with Cook Mode

**Auto-tracking in "Cook this Recipe":**
- Add "Mark as Complete" button at end of recipe steps
- Prompt user to rate and add notes
- Automatically update statistics on completion

**Manual Logging:**
- Allow marking recipes as cooked from recipe detail page
- Quick-add from recipe list view
- Batch import of past cooking history (optional)

### 6. Privacy and Data

**User Control:**
- Option to disable tracking
- Ability to delete tracking history
- Export statistics data

**Data Retention:**
- Keep detailed history for analysis
- Provide archive/deletion options
- Consider GDPR compliance for data export/deletion

## Benefits
- ✅ Provides valuable insights to users
- ✅ Encourages engagement with the app
- ✅ Helps users discover their cooking patterns
- ✅ Assists with meal planning based on preferences
- ✅ Creates sense of accomplishment and progress
- ✅ Data can inform future features (recommendations, smart shopping lists)
- ✅ Differentiation from competitor apps

## Risks
- ⚠️ Requires users to actively track cooking (adoption challenge)
- ⚠️ Additional database storage for historical data
- ⚠️ Privacy concerns with detailed usage tracking
- ⚠️ Performance impact of calculating statistics
- ⚠️ May be overwhelming for casual users
- ⚠️ Requires ongoing maintenance of tracking logic

## Testing Checklist
After implementation, verify:
- [ ] Recipe cook events are recorded correctly
- [ ] Ingredient usage counts update when recipes are cooked
- [ ] Statistics display accurate data
- [ ] Time period filters work correctly
- [ ] Most cooked recipes sort by frequency
- [ ] Most used ingredients calculate across all cooked recipes
- [ ] Manual cook logging works properly
- [ ] Auto-tracking from cook mode functions correctly
- [ ] Rating and notes save with cook history
- [ ] Statistics page performs well with large datasets
- [ ] Privacy controls work (disable tracking, delete history)
- [ ] Data exports correctly (if implemented)
- [ ] Charts and visualizations render properly
- [ ] Mobile responsive design works
- [ ] Historical data migration (if needed) completes successfully

## References
- "Cook this recipe" feature implementation
- Recipe and ingredient database schemas
- Dashboard UI components
- Analytics/charting libraries (Chart.js, Recharts, etc.)

## Notes
- Consider gamification elements (badges, achievements)
- Could add social features (compare with friends, cooking challenges)
- Integrate with grocery list to suggest frequently used ingredients
- Use stats to recommend recipes user might like based on ingredient preferences
- Consider seasonal trends in cooking
- May want to add nutritional tracking in the future
- Keep initial version simple, expand based on user feedback
- Consider adding cooking goals feature (e.g., "Cook 30 recipes this month")
