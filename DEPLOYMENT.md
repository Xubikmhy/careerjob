# 🚀 Career Job Solution - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- An OpenRouter API key (free at [openrouter.ai/keys](https://openrouter.ai/keys))

## 🔧 Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API**
3. Copy your project URL and anon key
4. Go to **SQL Editor** and run the `schema.sql` file to create tables

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# OpenRouter AI Configuration
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

> ⚠️ **Security Note**: Never commit the `.env` file to git. Use `.env.example` as a template.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🌐 Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy
vercel
```

### Option 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **"Add New Project"**
4. Import your repository
5. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENROUTER_API_KEY`
6. Click **Deploy**

The `vercel.json` file is already configured with the correct build settings.

## 🔵 Deploy to Netlify

### Option 1: Using Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option 2: Using Netlify Dashboard

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click **"Add new site"** > **"Import an existing project"**
4. Connect to your GitHub repository
5. Build settings are already configured in `netlify.toml`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENROUTER_API_KEY`
7. Click **Deploy**

## 🔍 Troubleshooting

### Issue: "Supabase connection failed"

**Solution**: 
- Verify your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Ensure you've run the `schema.sql` in your Supabase SQL Editor
- Check that you're using the **anon** key, not the service_role key

### Issue: "OpenRouter API error"

**Solution**:
- Verify your `VITE_OPENROUTER_API_KEY` is set correctly
- Check your API key is active at [openrouter.ai/keys](https://openrouter.ai/keys)
- Ensure you have API credits remaining

### Issue: "Build fails on deployment"

**Solution**:
- Run `npm run build` locally to test
- Check that all environment variables are set on your deployment platform
- Verify Node.js version is 18+ on the deployment platform

### Issue: "Blank page after deployment"

**Solution**:
- Check browser console for errors
- Verify all environment variables are properly set
- Ensure the database schema has been created in Supabase

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon public key | `eyJhbGc...` |
| `VITE_OPENROUTER_API_KEY` | Yes | OpenRouter API key for AI features | `sk-or-...` |

## 🔐 Security Best Practices

1. **Never commit** `.env` file to version control
2. **Always use** the anon key, not the service_role secret
3. **Enable RLS** (Row Level Security) in Supabase for production
4. **Rotate keys** regularly
5. **Monitor API usage** to prevent abuse

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

## 🆘 Support

If you encounter issues not covered here:
1. Check the browser console for error messages
2. Review Supabase logs in your project dashboard
3. Verify all environment variables are correctly set
