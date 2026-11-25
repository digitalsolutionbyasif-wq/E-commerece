import { createHash } from 'node:crypto';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';

const FIREBASE_PROJECT_ID =
  process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'gen-lang-client-0847114707';
const FIRESTORE_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID || 'ai-studio-cfb950f8-61d5-458b-b89d-43d195325227';

const app = getApps().length ? getApp() : initializeApp({ projectId: FIREBASE_PROJECT_ID });
const db =
  FIRESTORE_DATABASE_ID && FIRESTORE_DATABASE_ID !== '(default)'
    ? getFirestore(app, FIRESTORE_DATABASE_ID)
    : getFirestore(app);

const STATIC_ALLOWED_ORIGINS = new Set<string>([
  'https://ais-dev-kam6ik4zhs6jvfizqmm5gp-1016226216098.asia-east1.run.app',
  'https://ais-pre-kam6ik4zhs6jvfizqmm5gp-1016226216098.asia-east1.run.app',
  'https://gen-lang-client-0847114707.web.app',
  'https://gen-lang-client-0847114707.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost:5173',
]);

if (process.env.APP_URL) {
  STATIC_ALLOWED_ORIGINS.add(process.env.APP_URL.replace(/\/+$/, ''));
}

if (process.env.ALLOWED_ORIGINS) {
  for (const entry of process.env.ALLOWED_ORIGINS.split(',')) {
    const trimmed = entry.trim().replace(/\/+$/, '');
    if (trimmed) STATIC_ALLOWED_ORIGINS.add(trimmed);
  }
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  const normalized = origin.replace(/\/+$/, '');
  if (STATIC_ALLOWED_ORIGINS.has(normalized)) return true;
  // Allow AI Studio Cloud Run preview subdomains if URL rotates
  return /^https:\/\/ais-(dev|pre)-[a-z0-9-]+-[0-9]+\.[a-z0-9-]+\.run\.app$/i.test(normalized);
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

function validateAndNormalizeEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const normalized = input.trim().toLowerCase();
  if (normalized.length < 3 || normalized.length > 200) return null;
  if (normalized.includes('..') || !EMAIL_REGEX.test(normalized)) return null;
  const [localPart, domain] = normalized.split('@');
  if (!localPart || !domain || localPart.length > 64 || domain.length > 253) return null;
  return normalized;
}

function sanitizeSource(input: unknown): string {
  if (typeof input !== 'string') return 'newsletter-form';
  const cleaned = input.trim().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
  return cleaned || 'newsletter-form';
}

function makeSubscriberDocId(normalizedEmail: string): string {
  const hash = createHash('sha256').update(normalizedEmail).digest('hex').slice(0, 32);
  return `sub_${hash}`;
}

/**
 * HTTP Cloud Function to validate and store newsletter email addresses
 * in the `newsletterSubscribers` Firestore collection with a server timestamp.
 */
export const subscribeNewsletter = onRequest(
  {
    region: 'asia-east1',
    maxInstances: 10,
  },
  async (req, res) => {
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;

    if (!isAllowedOrigin(origin)) {
      res.status(403).json({ ok: false, error: 'Origin not allowed.' });
      return;
    }

    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      const body =
        req.body && typeof req.body === 'object' && !Array.isArray(req.body)
          ? (req.body as Record<string, unknown>)
          : {};

      const normalizedEmail = validateAndNormalizeEmail(body.email);
      if (!normalizedEmail) {
        res.status(400).json({
          ok: false,
          error: 'Please enter a valid email address (up to 200 characters).',
        });
        return;
      }

      const source = sanitizeSource(body.source);

      // Associate authenticated Firebase user ID when a valid Bearer ID token is provided;
      // otherwise record as a verified guest newsletter subscriber.
      let userId = 'guest';
      const authHeader = req.headers.authorization;
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.slice(7).trim();
        if (idToken) {
          try {
            const decoded = await getAuth(app).verifyIdToken(idToken);
            if (decoded.uid && /^[a-zA-Z0-9_-]{1,128}$/.test(decoded.uid)) {
              userId = decoded.uid;
            }
          } catch {
            // Unauthenticated or expired token falls back to guest subscriber attribution
            userId = 'guest';
          }
        }
      }

      const subscriberId = makeSubscriberDocId(normalizedEmail);
      const docRef = db.collection('newsletterSubscribers').doc(subscriberId);

      const outcome = await db.runTransaction(async (tx) => {
        const existingSnap = await tx.get(docRef);
        if (existingSnap.exists && existingSnap.get('status') !== 'unsubscribed') {
          tx.update(docRef, {
            updatedAt: FieldValue.serverTimestamp(),
            ...(userId !== 'guest' ? { userId } : {}),
          });
          return { alreadySubscribed: true };
        }

        tx.set(docRef, {
          email: normalizedEmail,
          userId,
          status: 'subscribed',
          source,
          subscribedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        return { alreadySubscribed: false };
      });

      res.status(outcome.alreadySubscribed ? 200 : 201).json({
        ok: true,
        alreadySubscribed: outcome.alreadySubscribed,
        subscriberId,
        email: normalizedEmail,
        message: outcome.alreadySubscribed
          ? 'This email is already subscribed to Digital E-Commerce by ASIF updates.'
          : 'Subscribed to Digital E-Commerce by ASIF updates!',
      });
    } catch (err) {
      logger.error('Failed to store newsletter subscriber', {
        error: err instanceof Error ? err.message : String(err),
      });
      res.status(500).json({
        ok: false,
        error: 'Unable to save subscription right now. Please try again shortly.',
      });
    }
  },
);
