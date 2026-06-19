import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

/**
 * Returns true when `id` is a syntactically valid MongoDB ObjectId string.
 * Does NOT check whether the document exists in the database.
 */
export function isValidObjectId(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

/**
 * Convenience guard for route handlers.
 * Returns a 400 NextResponse when the id is invalid, otherwise returns null.
 *
 * @example
 * const bad = badId(params.id, 'product');
 * if (bad) return bad;
 */
export function badId(id, label = 'ID') {
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: `Invalid ${label}` }, { status: 400 });
  }
  return null;
}

/** Allowed MIME types for image uploads. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Maximum upload size: 10 MB */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Validates a File object from formData for image uploads.
 * Returns an error string if invalid, or null if valid.
 */
export function validateImageFile(file) {
  if (!file || typeof file.size !== 'number') return 'No file provided';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Unsupported file type "${file.type}". Allowed: JPEG, PNG, WebP`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: 10 MB`;
  }
  return null;
}
