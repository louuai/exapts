/**
 * Image storage abstraction.
 *
 *   storeImage(payload)
 *     where payload is either a data: URL (string) or an http(s) URL.
 *     - If CLOUDINARY_URL is configured, uploads data: URLs to Cloudinary
 *       (using an unsigned upload preset) and returns the secure_url.
 *     - Otherwise returns the payload unchanged (legacy base64 path).
 *
 * This keeps the API surface stable while letting the operator switch to
 * Cloudinary just by setting env vars — no code change required.
 */
import { env } from './env.js';
import { logger } from './logger.js';

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIME = /^image\/(png|jpe?g|gif|webp|avif)$/i;

function parseCloudinaryUrl(url) {
  // cloudinary://<api_key>:<api_secret>@<cloud_name>
  const m = url?.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!m) return null;
  return { apiKey: m[1], apiSecret: m[2], cloudName: m[3] };
}

const creds = env.CLOUDINARY_URL ? parseCloudinaryUrl(env.CLOUDINARY_URL) : null;
const preset = env.CLOUDINARY_UPLOAD_PRESET;

/* Server-side validation for data: URLs */
function validateDataUrl(dataUrl) {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error('Invalid data URL');
  const [, mime, b64] = m;
  if (!ALLOWED_MIME.test(mime)) throw new Error(`Unsupported image type: ${mime}`);
  // Rough size check (base64 inflates by 4/3)
  const approxBytes = Math.ceil((b64.length * 3) / 4);
  if (approxBytes > MAX_BYTES) throw new Error('Image too large (max 4 MB)');
  return { mime, b64 };
}

export async function storeImage(payload) {
  if (!payload || typeof payload !== 'string') return payload;

  // Already a regular URL — passthrough
  if (!payload.startsWith('data:')) return payload;

  // Validate even if we're not uploading (defence in depth)
  validateDataUrl(payload);

  // No Cloudinary configured → legacy passthrough (caller stores data: URL)
  if (!creds || !preset) return payload;

  const form = new URLSearchParams();
  form.append('file', payload);
  form.append('upload_preset', preset);
  form.append('folder', 'omega');

  const url = `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`;
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    logger.error({ status: res.status, body }, 'Cloudinary upload failed');
    throw new Error(`Cloudinary upload failed (${res.status})`);
  }
  const data = await res.json();
  return data.secure_url || data.url;
}

/** Process arrays of image payloads in parallel. */
export async function storeImages(arr) {
  if (!Array.isArray(arr)) return arr;
  return Promise.all(arr.map((p) => storeImage(p).catch((err) => {
    logger.warn({ err: err.message }, 'image upload failed, keeping original payload');
    return p;
  })));
}
