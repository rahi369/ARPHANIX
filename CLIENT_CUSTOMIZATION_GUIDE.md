# Client Customization & Deployment Guide

This guide explains how to clone, rebrand, configure, and deploy this white-label editorial portfolio and business platform for a new client with complete data isolation.

---

## 1. Where to Change Client Information

You can manage client information in **two ways**:

1. **Live in the Admin CMS (Recommended — Zero Code Edits, Mobile-Friendly):**
   - Sign in at your secret admin entry route (default: `/studio-admin-portal`, or press `Alt + Shift + R` / tap the footer copyright text 5 times).
   - Open **Client Customization** to edit the client's Full Name, Brand/Business Name, Professional Title, Profile Photo, Logo, Cover Image, Biography, Location, Email, WhatsApp, Social Links, SEO Title & Description, Website Theme Colors, Navigation Labels, and Footer Information.
   - Changes publish immediately to Cloud Firestore and update the live site without rebuilding.

2. **Initial Code Defaults (Before First Firestore Seed):**
   - Edit `src/config/clientConfig.ts` for initial baseline defaults.
   - Edit `server/clientKnowledgeBase.ts` for baseline server-side fallback facts before the Admin Knowledge Base is saved.

---

## 2. How to Change the Brand Name & Logo

1. Open **Admin CMS -> Client Customization**.
2. Update **Brand / Business Name**.
3. Under **Profile Photo, Logo & Cover Image**, upload a transparent PNG or WebP logo via **Upload File** (or paste an HTTPS URL).
4. Click **Save & Publish All**. Both the sticky navigation header and footer update automatically.
5. *(Optional)* Update `VITE_BRAND_NAME` in your Vercel environment variables so the pre-React loading screen (`index.html` / `BrandLoadingScreen.tsx`) matches before Firestore finishes streaming.

---

## 3. How to Replace Profile & Portfolio Images

Every image uploader in the Admin CMS automatically resizes and compresses photos to WebP in the browser before uploading:

- **Profile Photo / Cover Image / Logo:** **Admin CMS -> Client Customization** or **Profile & About**.
- **Design Gallery Works:** **Admin CMS -> Design Gallery -> Add Work / Edit**.
- **Project Case Study Screenshots:** **Admin CMS -> Projects -> Multi-Screenshot Uploader** (supports up to 8 screenshots per project).
- **Service Cover Images:** **Admin CMS -> Services**.
- **Certificates & CV PDF:** **Admin CMS -> Awards & CV**.

---

## 4. How to Configure the Client's AI Assistant

1. Go to **Admin CMS -> AI Knowledge Base**.
2. Under **Client AI Personality Settings**, configure:
   - **Assistant Name** and **Assistant Role**
   - **Greeting Message** (shown when visitors open the AI Drawer or `/assistant` page)
   - **Preferred Response Language** (e.g., `English`, `Bangla`, `Auto-detect (English, Bangla, Banglish)`)
   - **Response Tone & Personality**
   - **Main Responsibilities**, **Topics It Can Answer**, and **Topics It Must Avoid**
   - **Contact Recommendation Behavior**
   - **WENDAXY Developer Contact Details** (optional; shared only if a visitor explicitly asks who built the website)
3. Click **Update AI Knowledge** to save and invalidate the server cache immediately.

---

## 5. How to Paste & Update an AI-Generated Knowledge Base

1. Open **Admin CMS -> AI Knowledge Base**.
2. Scroll to **Paste Complete Client Profile / AI Knowledge Document** and paste the client's full dossier, markdown profile, or AI-generated knowledge document (up to 60,000 characters), and/or fill out the structured fields below it.
3. Use the live controls:
   - **Save Knowledge Base** — saves to Firestore and archives the previous snapshot.
   - **Update AI Knowledge** — saves and pushes changes live to the Gemini AI server immediately (no rebuild or redeploy required).
   - **Preview AI Knowledge** — inspects the exact compiled JSON payload sent to the AI.
   - **Test AI Assistant** — runs a live test prompt directly inside the CMS.
   - **Restore Previous Version** — rolls back to the prior saved snapshot in one click.
   - **Clear Knowledge Base** — clears all fields after confirmation while keeping the previous snapshot available for recovery.

---

## 6. How to Configure Firebase & Gemini API

### Firebase (Per-Client Isolation)
1. Create a dedicated Firebase project for the client in the Firebase Console.
2. Enable **Cloud Firestore** and **Firebase Authentication** (Google Sign-In and/or Email/Password).
3. Enable **Firebase Storage** if you want Tier-3 fallback media storage.
4. Update `firebase-applet-config.json` (or set `VITE_FIREBASE_*` environment variables in Vercel) with the new client's Firebase Web SDK config.
5. Update `firestore.rules` and `storage.rules` if changing the primary admin email, then deploy rules (`firebase deploy --only firestore:rules,storage`).

### Gemini API
1. Generate a `GEMINI_API_KEY` in Google AI Studio for the client's project.
2. Add `GEMINI_API_KEY` as a **server-side** environment variable (never prefix it with `VITE_`).

---

## 7. How to Configure Cloudinary

1. Create a free Cloudinary account for the client.
2. In Cloudinary **Settings -> Upload -> Upload Presets**, create an **Unsigned** upload preset.
3. Enter the **Cloud Name** and **Unsigned Upload Preset** in **Admin CMS -> Cloudinary & Backup** (or set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`).
4. Click **Test Cloudinary Connection** in the Admin CMS to verify direct browser uploads and the authenticated `/api/cloudinary-relay` fallback.

---

## 8. How to Deploy a Separate Client Website Using Vercel

1. Fork or clone this repository into a new Git repository for the client.
2. Import the repository into **Vercel** (`framework: "vite"`, `outputDirectory: "dist"`).
3. Configure the client's isolated environment variables (listed in Section 9).
4. Deploy. `vercel.json` automatically handles:
   - `maxDuration: 30` for `/api/ai/chat` and `/api/cloudinary-relay`
   - `Cache-Control: public, max-age=0, must-revalidate` on `/` and `/index.html`
   - `Cache-Control: public, max-age=31536000, immutable` on `/assets/*`
   - SPA fallback rewrites excluding `/api/*`
5. Visit the client's secret admin URL (`VITE_ADMIN_ENTRY_PATH`), sign in with `VITE_ADMIN_EMAIL`, and click **Initialize / Re-Sync Defaults to Firestore** on the Overview tab to seed their fresh database.

---

## 9. Environment Variables to Change for Each Client

| Variable | Scope | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Server-only | Gemini AI SDK key for `/api/ai/chat` |
| `APP_URL` | Server-only | Deployed production URL |
| `VITE_BRAND_NAME` | Client + Server | Initial brand wordmark on boot loader |
| `VITE_ADMIN_EMAIL` | Client + Server | Verified admin email permitted into CMS & upload relay |
| `VITE_ADMIN_ENTRY_PATH` | Client | Obscured route path for Admin Login (e.g., `/client-portal-9x`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Client | Default Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Client | Default Cloudinary unsigned preset |
| `VITE_FIREBASE_API_KEY` | Client | Client's Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Client | Client's Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Client + Server | Client's isolated Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Client | Client's Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Client | Client's Firebase Sender ID |
| `VITE_FIREBASE_APP_ID` | Client | Client's Firebase App ID |
| `VITE_FIREBASE_DATABASE_ID` | Client + Server | Client's Firestore database ID (if non-default) |
