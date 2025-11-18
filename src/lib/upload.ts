import { put, del } from '@vercel/blob';

/**
 * Upload an image to Vercel Blob Storage
 * @param file - The file to upload
 * @param folder - The folder to store the file in (default: 'recipes')
 * @returns The URL of the uploaded file
 */
export async function uploadImage(
  file: File,
  folder: string = 'recipes'
): Promise<string> {
  const timestamp = Date.now();
  const filename = `${folder}/${timestamp}-${file.name}`;

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return blob.url;
}

/**
 * Delete an image from Vercel Blob Storage
 * @param url - The URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - deletion failures shouldn't block other operations
  }
}

/**
 * Validate image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns true if valid, error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB. Please choose a smaller image.`,
    };
  }

  return { valid: true };
}
