# 🚀 Quick Setup Guide

This guide will get you up and running in **5 minutes**.

## Step 1: Get Your API Keys (Free!)

### Supabase Setup (2 minutes)
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Fill in project details and wait for setup (~2 minutes)
4. Once ready, go to **Settings** → **API**
5. Copy these two values:
   - **Project URL** (looks like: `https://abc123xyz.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
6. Go to **SQL Editor** → Click **"New Query"**
7. Copy and paste the entire `schema.sql` file
8. Click **"Run"** to create the database tables

### OpenRouter API Key (30 seconds)
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign in with Google
3. Click **"Create Key"**
4. Copy the key (starts with `sk-or-...`)

## Step 2: Configure Your Project (30 seconds)

Create a file called `.env` in the project root (same folder as package.json):

```bash
VITE_SUPABASE_URL=paste_your_supabase_url_here
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
VITE_OPENROUTER_API_KEY=paste_your_openrouter_key_here
```

**Example:**
```bash
VITE_SUPABASE_URL=https://ehzjqyprwnklavufqkbs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OPENROUTER_API_KEY=sk-or-v1-58080971b5b203...
```

## Step 3: Run the App (1 minute)

Open terminal in the project folder and run:

```bash
# Install dependencies (only needed once)
npm install

# Start the development server
npm run dev
```

Open your browser to: **http://localhost:3000**

## ✅ You're Done!

The application should now be fully functional with:
- ✅ Database connected (Supabase)
- ✅ AI features working (OpenRouter)
- ✅ All views accessible

---

## 🌐 Deploy to Production (Optional)

### Vercel (Easiest - Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy:**
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Add the 3 environment variables from your `.env` file
   - Click **"Deploy"**
   - Done! Your app will be live in ~2 minutes

### Netlify (Also Easy)

1. **Push to GitHub** (same as above)

2. **Deploy:**
   - Go to [netlify.com](https://netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect your GitHub repository
   - Add the 3 environment variables
   - Click **"Deploy site"**
   - Done!

---

## 🆘 Troubleshooting

### "Not Connected" showing in sidebar?
- Check your `.env` file has all 3 variables
- Make sure there are no extra spaces or quotes around the values
- Restart the dev server (`Ctrl+C` then `npm run dev` again)

### "Database error" when adding data?
- Make sure you ran the `schema.sql` in Supabase SQL Editor
- Check that your Supabase URL ends with `.supabase.co`

### AI features not working?
- Verify your OpenRouter API key starts with `sk-or-`
- Check you have credits at [openrouter.ai/credits](https://openrouter.ai/credits)

### Build fails?
- Run `npm install` again
- Make sure Node.js version is 18 or higher (`node --version`)

---

## 📱 App Features Overview

Once running, you can:

1. **Dashboard** - View statistics and recent activity
2. **Candidates** - Add and manage job seekers
3. **Vacancies** - Post job openings
4. **Placements** - Track successful hires and commissions
5. **CV Studio** - Create professional CVs with AI assistance
6. **Settings** - Customize your agency details

---

## 💡 Pro Tips

- **Test Data**: Add a few test candidates and vacancies to see how everything works
- **AI Magic**: Use the "Auto-Polish" button in CV Studio to see AI enhancement
- **Commission Tracking**: Set your commission percentage in Settings
- **Export CVs**: Use the print function in CV Studio to save CVs as PDF

---

Need more help? Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide!
