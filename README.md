# My Space — Setup & Deploy Guide

## What It Is
Your personal knowledge base: paste Copilot chats, video notes, markdown files, code snippets. Password-protected, multi-user, with a Vault section for private content.

## Local Development

### 1. Copy env file
```bash
cp .env.local.example .env.local
```
Fill in your Upstash credentials and generate a `NEXTAUTH_SECRET`:
```bash
# Generate a secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel (Free)

### Step 1: Push to GitHub
1. Create a new repo on GitHub (private recommended)
2. Push this project:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/my-space.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `my-space` repo
4. Click **Deploy** (ignore build errors for now — add env vars first)

### Step 3: Add Environment Variables
In Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | From Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash dashboard |
| `NEXTAUTH_SECRET` | Random 32+ char string |
| `NEXTAUTH_URL` | Your Vercel URL (e.g. https://my-space-abc.vercel.app) |
| `ADMIN_USERNAME` | Your chosen admin username |
| `ADMIN_PASSWORD` | Your chosen admin password |

### Step 4: Redeploy
After adding env vars, go to Deployments → click the three dots → **Redeploy**.

### Step 5: Create Admin User
Run the seed script once to create your admin account:
```bash
UPSTASH_REDIS_REST_URL=xxx UPSTASH_REDIS_REST_TOKEN=xxx ADMIN_USERNAME=yourname ADMIN_PASSWORD=yourpassword node scripts/seed-admin.mjs
```
Or run it locally with your `.env.local` values set.

---

## Upstash Setup

1. Go to https://console.upstash.com
2. Create a new **Redis** database (free tier)
3. Choose any region close to you
4. Copy **REST URL** and **REST Token** to your env vars

---

## First Login

1. Go to your Vercel URL
2. Log in with your `ADMIN_USERNAME` / `ADMIN_PASSWORD`
3. Go to **Profile** → set your Vault password
4. Go to **Admin** → create additional users if needed

---

## Adding New Notes

**From browser (any device):**
- Click **+ New Entry** → paste your content → Save

**From .md files:**
- Click the upload icon in the header → Import page → drop your .md file

**Auto-deploy from GitHub:**
- The app auto-deploys whenever you push to your repo

---

## Sections

| Section | Use for |
|---|---|
| Work | Copilot chats, work notes, team context |
| Learning | What you studied, tutorials, concepts |
| Ideas | Random thoughts, plans, brainstorming |
| Diary | Personal daily entries |
| Snippets | Reusable code you want to keep |
| 🔒 Vault | Private content — unlocks per-visit with separate password |

You can create, rename, and delete additional sections from the sidebar.
