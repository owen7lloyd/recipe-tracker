# Enhancement: Recipe Creation via Cookbook Photo Upload

## Status
🔴 Open

## Priority
Medium

## Description
Allow users to create recipes by uploading photographs of cookbook pages or recipe cards. The system will use OCR (Optical Character Recognition) and AI-powered parsing to extract recipe information (title, ingredients, steps, cooking times, servings) from the uploaded image and automatically populate a new recipe entry.

## Current Implementation
Users must manually enter all recipe information when creating recipes. The only automated option is importing from web URLs. There is no support for digitizing physical cookbooks or handwritten recipe cards.

## Required Changes

### 1. Image Upload Component

**Upload Interface:**
```
┌─────────────────────────────────────────────────┐
│  Create New Recipe                              │
├─────────────────────────────────────────────────┤
│  [📝 Manual Entry]  [🌐 Import URL]  [📷 Photo] │
├─────────────────────────────────────────────────┤
│                                                 │
│    ┌─────────────────────────────────┐          │
│    │                                 │          │
│    │    📷 Upload Cookbook Photo     │          │
│    │                                 │          │
│    │    Drop image here or click     │          │
│    │    to browse                    │          │
│    │                                 │          │
│    │    Supports: JPG, PNG, HEIC     │          │
│    │    Max size: 10MB               │          │
│    └─────────────────────────────────┘          │
│                                                 │
│    💡 Tips for best results:                    │
│    • Ensure good lighting                       │
│    • Keep the page flat and in focus            │
│    • Include the full recipe in frame           │
│    • Avoid shadows and glare                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Mobile Camera Integration:**
```typescript
interface PhotoUploadOptions {
  source: 'camera' | 'gallery' | 'file';
  maxSize: number; // bytes
  allowedTypes: string[];
  enableCrop: boolean;
}

// On mobile, offer direct camera access
const captureOptions = {
  camera: {
    label: 'Take Photo',
    icon: '📸',
    accept: 'image/*',
    capture: 'environment' // Use rear camera
  },
  gallery: {
    label: 'Choose from Gallery',
    icon: '🖼️',
    accept: 'image/*'
  }
};
```

### 2. Image Processing Pipeline

**Processing Flow:**
```
Upload → Validate → Preprocess → OCR → Parse → Review → Save
```

**Image Validation:**
```typescript
interface ImageValidation {
  maxFileSize: number;        // 10MB
  minResolution: number;      // 800x600
  maxResolution: number;      // 4096x4096
  allowedFormats: string[];   // ['jpg', 'jpeg', 'png', 'heic', 'webp']
  minQuality: number;         // Blur detection threshold
}

async function validateImage(file: File): Promise<ValidationResult> {
  // Check file size
  // Check dimensions
  // Check format
  // Optional: blur detection
  // Optional: orientation detection
}
```

**Image Preprocessing:**
```typescript
async function preprocessImage(image: ImageData): Promise<ProcessedImage> {
  // Auto-rotate based on EXIF data
  // Perspective correction (deskew)
  // Contrast enhancement
  // Noise reduction
  // Resize if needed for API limits
  return processedImage;
}
```

### 3. OCR Integration

**OCR Service Options:**

**Option A: Cloud OCR API (Recommended)**
```typescript
// Using Google Cloud Vision, AWS Textract, or Azure Computer Vision
interface OCRService {
  extractText(image: Buffer): Promise<OCRResult>;
  detectLayout(image: Buffer): Promise<LayoutResult>;
}

interface OCRResult {
  fullText: string;
  blocks: TextBlock[];
  confidence: number;
  language: string;
}

interface TextBlock {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
  type: 'title' | 'paragraph' | 'list' | 'unknown';
}
```

**Option B: Open Source (Tesseract)**
```typescript
// Using Tesseract.js for client-side OCR
import Tesseract from 'tesseract.js';

async function extractText(imageUrl: string): Promise<string> {
  const result = await Tesseract.recognize(imageUrl, 'eng', {
    logger: m => console.log(m)
  });
  return result.data.text;
}
```

### 4. AI-Powered Recipe Parsing

**Recipe Structure Detection:**
```typescript
interface ParsedRecipe {
  title: string;
  description?: string;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  ingredients: ParsedIngredient[];
  instructions: ParsedInstruction[];
  notes?: string;
  source?: string;
  confidence: number;
}

interface ParsedIngredient {
  quantity?: number;
  unit?: string;
  name: string;
  preparation?: string;
  optional: boolean;
  confidence: number;
}

interface ParsedInstruction {
  stepNumber: number;
  text: string;
  duration?: number;
  confidence: number;
}
```

**AI Parsing Prompt:**
```typescript
const parseRecipePrompt = `
Extract recipe information from the following OCR text.
Return a structured JSON object with:
- title: Recipe name
- description: Brief description if present
- servings: Number of servings (as integer)
- prepTime: Preparation time in minutes
- cookTime: Cooking time in minutes
- ingredients: Array of {quantity, unit, name, preparation, optional}
- instructions: Array of {stepNumber, text, duration}
- notes: Any additional notes or tips

Handle common OCR errors:
- "1/2" may appear as "1⁄2" or "½"
- "tablespoon" may appear as "tbsp" or "T"
- Numbers may be misread (e.g., "1" as "l")

OCR Text:
{extractedText}
`;
```

**Parsing Pipeline:**
```typescript
async function parseRecipeFromOCR(ocrResult: OCRResult): Promise<ParsedRecipe> {
  // 1. Clean OCR text
  const cleanedText = cleanOCRText(ocrResult.fullText);

  // 2. Use AI to extract structured data
  const parsedRecipe = await aiParseRecipe(cleanedText);

  // 3. Validate and normalize data
  const normalizedRecipe = normalizeRecipe(parsedRecipe);

  // 4. Match ingredients to known database entries
  const matchedRecipe = await matchIngredients(normalizedRecipe);

  return matchedRecipe;
}
```

### 5. Review and Edit Interface

**Post-Processing Review:**
```
┌─────────────────────────────────────────────────────────┐
│  Review Extracted Recipe                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────────────┐ │
│  │                  │  │ Title:                       │ │
│  │  [Uploaded       │  │ ┌────────────────────────┐   │ │
│  │   Image          │  │ │ Chocolate Chip Cookies │   │ │
│  │   Preview]       │  │ └────────────────────────┘   │ │
│  │                  │  │                              │ │
│  │                  │  │ Servings: [24] cookies       │ │
│  │                  │  │ Prep: [15] min  Cook: [12] min│ │
│  └──────────────────┘  └──────────────────────────────┘ │
│                                                         │
│  Ingredients:                              [+ Add]      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⚠️  2 1/4 cups all-purpose flour               [✏️] │
│  │ ✓  1 tsp baking soda                           [✏️] │
│  │ ✓  1 tsp salt                                  [✏️] │
│  │ ⚠️  1 cup (2 sticks) butter, softened          [✏️] │
│  │ ✓  3/4 cup granulated sugar                    [✏️] │
│  └─────────────────────────────────────────────────┘   │
│  ⚠️ = Low confidence, please verify                    │
│                                                         │
│  Instructions:                             [+ Add]      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. Preheat oven to 375°F.                  [✏️] │   │
│  │ 2. Combine flour, baking soda, and salt... [✏️] │   │
│  │ 3. Beat butter and sugars until creamy... [✏️]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [← Back]              [Save Recipe]  [Save & Edit More]│
└─────────────────────────────────────────────────────────┘
```

**Confidence Indicators:**
```typescript
interface ConfidenceDisplay {
  high: '✓';     // confidence > 0.9
  medium: '⚠️';   // confidence 0.7-0.9
  low: '❌';      // confidence < 0.7
}

// Highlight fields that need user attention
function getConfidenceStyle(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}
```

### 6. Database Storage

**Image Storage:**
```typescript
// Store original image for reference
interface RecipeImage {
  id: string;
  recipeId: string;
  originalUrl: string;     // S3/Supabase storage URL
  thumbnailUrl: string;
  uploadedAt: Date;
  ocrText?: string;        // Store raw OCR for debugging
  source: 'photo_upload' | 'manual' | 'web_import';
}
```

**Migration:**
```sql
-- Add source tracking to recipes
ALTER TABLE recipes ADD COLUMN source_type VARCHAR(50) DEFAULT 'manual';
ALTER TABLE recipes ADD COLUMN source_image_id UUID REFERENCES recipe_images(id);

-- Recipe images table
CREATE TABLE recipe_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_filename TEXT,
  mime_type VARCHAR(50),
  file_size INTEGER,
  ocr_text TEXT,
  ocr_confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7. API Endpoints

**Upload and Process:**
```typescript
// POST /api/recipes/upload-photo
interface UploadPhotoRequest {
  image: File;
}

interface UploadPhotoResponse {
  imageId: string;
  parsedRecipe: ParsedRecipe;
  ocrConfidence: number;
  processingTime: number;
}
```

**Save from Upload:**
```typescript
// POST /api/recipes/from-photo
interface CreateFromPhotoRequest {
  imageId: string;
  recipe: EditedRecipe;  // User-reviewed/edited recipe data
}
```

### 8. Error Handling

**Common Errors:**
```typescript
enum PhotoUploadError {
  IMAGE_TOO_LARGE = 'Image exceeds 10MB limit',
  INVALID_FORMAT = 'Unsupported image format',
  OCR_FAILED = 'Could not extract text from image',
  PARSE_FAILED = 'Could not identify recipe structure',
  LOW_QUALITY = 'Image quality too low for accurate extraction',
  NO_RECIPE_FOUND = 'No recipe detected in image',
  MULTIPLE_RECIPES = 'Multiple recipes detected - please crop to one'
}

// User-friendly error messages
const errorGuidance = {
  [PhotoUploadError.LOW_QUALITY]:
    'Try taking a new photo with better lighting and ensure the text is in focus.',
  [PhotoUploadError.NO_RECIPE_FOUND]:
    'The image doesn\'t appear to contain a recipe. Make sure the full recipe is visible.',
  // ...
};
```

### 9. Rate Limiting and Costs

**Usage Limits:**
```typescript
interface PhotoUploadLimits {
  maxUploadsPerDay: number;     // 20 per user
  maxUploadsPerMonth: number;   // 100 per user
  maxConcurrentProcessing: number;  // 3
}

// Track usage
interface UserPhotoUsage {
  userId: string;
  dailyCount: number;
  monthlyCount: number;
  lastResetDaily: Date;
  lastResetMonthly: Date;
}
```

**Cost Management:**
- Cache OCR results to avoid reprocessing
- Compress images before sending to OCR API
- Consider offering premium tier for higher limits

### 10. Multi-Page Recipe Support

**Handling Multi-Page Recipes:**
```
┌─────────────────────────────────────────────────┐
│  Upload Multiple Pages                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Page 1 of 2        Page 2 of 2                 │
│  ┌──────────┐       ┌──────────┐                │
│  │ [Image]  │       │ [Image]  │   [+ Add Page] │
│  │          │       │          │                │
│  └──────────┘       └──────────┘                │
│  [Remove]           [Remove]                    │
│                                                 │
│  [Combine & Process]                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

```typescript
interface MultiPageUpload {
  pages: UploadedPage[];
  combineStrategy: 'sequential' | 'manual_order';
}

async function processMultiplePages(pages: UploadedPage[]): Promise<ParsedRecipe> {
  // OCR each page
  const ocrResults = await Promise.all(pages.map(p => extractText(p.image)));

  // Combine text in order
  const combinedText = ocrResults.map(r => r.fullText).join('\n\n');

  // Parse combined text
  return parseRecipeFromOCR({ fullText: combinedText, ... });
}
```

## Benefits
- Allows digitization of physical cookbook collections
- Enables preservation of family recipe cards
- Faster than manual entry for printed recipes
- Makes the app useful for users with extensive physical recipe collections
- Reduces friction for new user onboarding
- Supports handwritten recipe cards (with good handwriting)
- Captures original recipe formatting and notes
- Creates searchable digital archive of physical recipes

## Risks
- OCR accuracy varies with image quality and font types
- Handwritten recipes may have low accuracy
- AI parsing may misinterpret unusual recipe formats
- API costs for OCR services (pay-per-use)
- Processing time may be slow for large images
- Privacy concerns with uploading cookbook content
- Copyright considerations for published cookbook recipes
- Users may expect 100% accuracy which is unrealistic
- Multiple languages/scripts add complexity
- Unusual units or ingredient names may not parse correctly

## Testing Checklist
After implementation, verify:
- [ ] Image upload works on desktop (drag & drop and file picker)
- [ ] Image upload works on mobile (camera and gallery)
- [ ] HEIC format from iPhone is handled correctly
- [ ] Large images are compressed appropriately
- [ ] OCR extracts text accurately from clear photos
- [ ] Recipe parsing correctly identifies title, ingredients, instructions
- [ ] Confidence indicators highlight uncertain fields
- [ ] User can edit all extracted fields before saving
- [ ] Low-confidence items are clearly marked for review
- [ ] Multi-page recipes combine correctly
- [ ] Error messages are helpful and actionable
- [ ] Rate limiting works correctly
- [ ] Original image is stored for reference
- [ ] Processing status/progress is displayed
- [ ] Cancel upload works correctly
- [ ] Works offline (queues for later processing)
- [ ] Handwritten recipes parse with reasonable accuracy
- [ ] Non-English recipes handled appropriately
- [ ] Unusual formats (index cards, newspaper clippings) work
- [ ] Recipe source is tracked correctly
- [ ] Integration with existing recipe creation flow is seamless

## References
- Recipe creation/import functionality
- Web import feature (Issue #07)
- Image storage configuration
- Ingredient database and matching
- Recipe data model and validation

## Notes
- Start with cloud OCR for accuracy, consider client-side for privacy-conscious users
- Could add "scan multiple recipes" batch mode for cookbook digitization projects
- Consider partnership with cookbook publishers for enhanced parsing rules
- Machine learning could improve parsing accuracy over time based on user corrections
- May want to detect and warn about copyrighted content
- Could extract recipe photos/images from cookbook pages
- Future enhancement: video recipe capture from cooking shows
- Consider adding a "recipe book" organization feature for digitized cookbooks
- May want to support scanning QR codes that link to online recipes
- Could offer handwriting training for improved recognition of specific users' handwriting
- Integration with phone's document scanner for better image preprocessing
- Consider adding nutrition label scanning as a related feature
