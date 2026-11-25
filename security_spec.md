# Security Specification & Payload-First TDD (`security_spec.md`)

## 1. Data Invariants
1. **Identity Integrity**: Every user-owned document (`orders`, `enrollments`, `tuitionRequests`, `testAttempts`, `reviews`, `contactMessages`, `newsletterSubscribers`, `users/{uid}`) MUST bind `userId` / `uid` to `request.auth.uid` on creation and preserve immutability on update.
2. **PII Isolation**: Email, phone, WhatsApp, delivery address, and city are isolated to `users/{userId}/private/info` or owner/admin-only documents (`orders`, `enrollments`, `tuitionRequests`, `contactMessages`, `newsletterSubscribers`). No unauthenticated or non-owner user may read another user's PII.
3. **RBAC Privilege Separation**: Users cannot self-assign `admin` or `staff` roles in `users/{uid}` or write to `admins/{uid}`. Admin access is determined strictly by `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or verified bootstrapped owner email (`digital.solution.by.asif@gmail.com` with `email_verified == true`).
4. **State & Moderation Locks**:
   - Orders must initialize with `status == 'Pending'` and cannot be altered by non-admins once in a terminal state (`Delivered`, `Cancelled`). Customers may only cancel while `Pending`.
   - Reviews must initialize with `status == 'pending'` and `verifiedPurchase == false` unless admin-created; only admins can transition a review to `approved`, `rejected`, or `hidden`. Public reads of `reviews` are strictly gated on `resource.data.status == 'approved'`.
5. **Catalog Integrity**: Only admins may create, update, or delete `products`, `courses`, `mcqQuestions`, and `siteSettings`.
6. **Temporal Integrity & Strict Keys**: Every write validates exact allowed keys (`hasAll` + `hasOnly` on create; `affectedKeys().hasOnly(...)` on update), strict string lengths, bounded arrays, valid document IDs (`^[a-zA-Z0-9_\-]+$`), and server timestamps (`request.time`).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on User Profile**: `{ uid: "u1", displayName: "Ali", role: "admin", isSuperUser: true, createdAt: NOW, updatedAt: NOW }` -> Rejected (`role != 'customer'` and extra key `isSuperUser`).
2. **Cross-User Order Spoofing**: Signed in as `u1`, create order with `userId: "u2"` -> Rejected (`incoming().userId == request.auth.uid` fails).
3. **Order Status Bypass on Create**: Create order with `status: "Confirmed"` or `status: "Delivered"` -> Rejected (`incoming().status == 'Pending'` required).
4. **Order Terminal State Tampering**: Customer attempts to update order from `Delivered` back to `Pending` -> Rejected (only Admin can update non-Pending or non-cancel transitions).
5. **Self-Published Fake Review**: Signed in as `u1`, create review with `status: "approved"` and `verifiedPurchase: true` -> Rejected (`status == 'pending'` and `verifiedPurchase == false` required).
6. **Unauthenticated PII Read**: Unauthenticated or non-owner reads `/orders/ord1` or `/users/u2/private/info` -> Rejected (`isOwner || isAdmin` required).
7. **Admin Privilege Escalation**: Signed-in non-admin creates `/admins/u1` -> Rejected (admin-only write).
8. **Catalog Price Tampering**: Non-admin updates `/products/p1` with `pricePkr: 1` -> Rejected (`isAdmin()` required).
9. **1MB String Denial-of-Wallet**: Create review or contact message with 50,000-character `comment` or 500-char doc ID -> Rejected (`isValidId` + string `.size()` limits).
10. **Email Verification Spoof**: Unverified account (`email_verified: false`) attempts write -> Rejected (`request.auth.token.email_verified == true` required).
11. **Unbounded Array Injection**: Admin or user tries to submit `items` array with 500 items or non-map element -> Rejected (`items.size() <= 50`).
12. **Blanket List Query Scraping**: Non-admin runs `list` on `orders` without `where('userId', '==', uid)` -> Rejected (`resource.data.userId == request.auth.uid || isAdmin()`).
