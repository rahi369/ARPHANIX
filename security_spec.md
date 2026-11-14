# Security Specification & Hardened ABAC Audit

## 1. Data Invariants
1. All public portfolio content (`site_profile`, `site_about`, `site_settings`, `gallery`, `projects`, `skills`, `experience`, `achievements`, `services`, `faqs`) is publicly readable (`allow get, list: if true`) and strictly writable ONLY by a verified Admin (`isAdmin()` requiring `request.auth != null && request.auth.token.email_verified == true` and either a verified allowlisted admin email—`rahihumaun369@gmail.com` or `seo.expert.samiaa@gmail.com`—or membership in `/admins/{uid}`).
2. Studio Media assets (`/media_assets/{assetId}`) allow exact-ID public reads (`allow get: if isValidId(assetId)`) for `/api/media`, while `list` and all writes are strictly restricted to `isAdmin()` with strict MIME allowlist and size limits (`sizeBytes <= 524288`, `dataBase64 <= 750000`).
3. Contact inquiries (`/messages/{msgId}`) contain PII (`email`, `whatsapp`). Visitors may `create` a message ONLY with `status == 'unread'`, strict field allowlist (`hasAll`/`hasOnly`), bounded string lengths, and `createdAt == request.time && updatedAt == request.time`. Public `get`, `list`, `update`, and `delete` are strictly denied (`if isAdmin()`).
4. Admin AI threads (`/ai_threads/{threadId}`) and subcollection messages (`/ai_threads/{threadId}/messages/{messageId}`) enforce `ownerUid == request.auth.uid && isAdmin()`, `isValidId()` path checks, and parent `get()` verification on subcollection writes.
5. Every document ID path variable on single-document operations is guarded by `isValidId(id)` (`^[a-zA-Z0-9_-]+$`, `<= 128` chars).
6. All `create` and `update` operations validate exact field shapes via `isValid[Entity](incoming())`, enforce `createdAt == request.time` on create and `createdAt == existing().createdAt && updatedAt == request.time` on update.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unverified Admin Email Spoof**: User signs in with matching admin email where `email_verified == false` and attempts to write `/site_profile/main`.
2. **Shadow Field Injection on Gallery**: Authenticated non-admin or admin attempts `create` on `/gallery/item1` with an extra ghost field `isVerified: true`.
3. **Public PII Scraping**: Unauthenticated visitor executes `list` or `get` on `/messages` or `/messages/msg1`.
4. **Contact Message Status Shortcutting**: Visitor submits `/messages/msg2` with `status: "read"` or `status: "archived"` instead of `"unread"`.
5. **Backdated Timestamp Spoofing**: Visitor submits `/messages/msg3` with `createdAt: Timestamp(2020-01-01)` instead of `request.time`.
6. **Denial-of-Wallet String Bomb**: Visitor submits `/messages/msg4` with a 50,000-character `description` string exceeding `maxLength: 3000`.
7. **ID Poisoning**: Attacker attempts `create` at `/messages/${'a'.repeat(500)}` or `/messages/bad$id`.
8. **Self-Privilege Escalation**: Non-admin authenticated user attempts `create` on `/admins/{theirUid}` with `{ role: 'admin' }`.
9. **Immutable `createdAt` Tampering**: Update attempt on `/projects/proj1` modifying `createdAt` to a new timestamp.
10. **Unbounded Array Bomb**: Update on `/projects/proj1` sending 50 entries in `techStack` (exceeds `<= 12`) or `screenshots` (exceeds `<= 8`).
11. **AI Thread Cross-Tenant Hijack**: Attacker attempts to create `/ai_threads/t1/messages/m1` under an `ai_threads/t1` owned by a different UID.
12. **Blanket Unprotected Collection Write**: Attacker attempts write to `/arbitrary_collection/doc1` caught by the global default-deny safety net.
