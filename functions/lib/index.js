"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeNewsletter = void 0;
const node_crypto_1 = require("node:crypto");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const https_1 = require("firebase-functions/v2/https");
const FIREBASE_PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'gen-lang-client-0847114707';
const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-cfb950f8-61d5-458b-b89d-43d195325227';
const app = (0, app_1.getApps)().length ? (0, app_1.getApp)() : (0, app_1.initializeApp)({ projectId: FIREBASE_PROJECT_ID });
const db = FIRESTORE_DATABASE_ID && FIRESTORE_DATABASE_ID !== '(default)'
    ? (0, firestore_1.getFirestore)(app, FIRESTORE_DATABASE_ID)
    : (0, firestore_1.getFirestore)(app);
const STATIC_ALLOWED_ORIGINS = new Set([
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
        if (trimmed)
            STATIC_ALLOWED_ORIGINS.add(trimmed);
    }
}
function isAllowedOrigin(origin) {
    if (!origin)
        return true;
    const normalized = origin.replace(/\/+$/, '');
    if (STATIC_ALLOWED_ORIGINS.has(normalized))
        return true;
    // Allow AI Studio Cloud Run preview subdomains if URL rotates
    return /^https:\/\/ais-(dev|pre)-[a-z0-9-]+-[0-9]+\.[a-z0-9-]+\.run\.app$/i.test(normalized);
}
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
function validateAndNormalizeEmail(input) {
    if (typeof input !== 'string')
        return null;
    const normalized = input.trim().toLowerCase();
    if (normalized.length < 3 || normalized.length > 200)
        return null;
    if (normalized.includes('..') || !EMAIL_REGEX.test(normalized))
        return null;
    const [localPart, domain] = normalized.split('@');
    if (!localPart || !domain || localPart.length > 64 || domain.length > 253)
        return null;
    return normalized;
}
function sanitizeSource(input) {
    if (typeof input !== 'string')
        return 'newsletter-form';
    const cleaned = input.trim().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
    return cleaned || 'newsletter-form';
}
function makeSubscriberDocId(normalizedEmail) {
    const hash = (0, node_crypto_1.createHash)('sha256').update(normalizedEmail).digest('hex').slice(0, 32);
    return `sub_${hash}`;
}
/**
 * HTTP Cloud Function to validate and store newsletter email addresses
 * in the `newsletterSubscribers` Firestore collection with a server timestamp.
 */
exports.subscribeNewsletter = (0, https_1.onRequest)({
    region: 'asia-east1',
    maxInstances: 10,
}, async (req, res) => {
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
        const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
            ? req.body
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
                    const decoded = await (0, auth_1.getAuth)(app).verifyIdToken(idToken);
                    if (decoded.uid && /^[a-zA-Z0-9_-]{1,128}$/.test(decoded.uid)) {
                        userId = decoded.uid;
                    }
                }
                catch {
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
                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                    ...(userId !== 'guest' ? { userId } : {}),
                });
                return { alreadySubscribed: true };
            }
            tx.set(docRef, {
                email: normalizedEmail,
                userId,
                status: 'subscribed',
                source,
                subscribedAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
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
    }
    catch (err) {
        logger.error('Failed to store newsletter subscriber', {
            error: err instanceof Error ? err.message : String(err),
        });
        res.status(500).json({
            ok: false,
            error: 'Unable to save subscription right now. Please try again shortly.',
        });
    }
});
//# sourceMappingURL=index.js.map