'use server';

import { put, del } from '@vercel/blob';

/**
 * Upload an image to Vercel Blob Storage (Server Action)
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
 * Delete an image from Vercel Blob Storage (Server Action)
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
