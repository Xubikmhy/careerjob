# 💼 Career Job Solution

A modern, AI-powered recruitment management system built with React, Supabase, and OpenRouter AI.

## ✨ Features

- 📊 **Dashboard**: Real-time statistics and insights
- 👥 **Candidate Management**: Track and manage job seekers
- 💼 **Vacancy Management**: Post and manage job openings
- 🎯 **Placement Tracking**: Monitor successful placements and commissions
- 📄 **AI-Powered CV Studio**: Generate professional CVs with AI assistance
- 🤖 **AI Enhancement**: Automatically improve candidate profiles using OpenRouter AI
- ⚙️ **Settings**: Customize agency details and commission rates

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Supabase account (free tier available)
- OpenRouter API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd careerjob
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the `schema.sql` file in your Supabase SQL Editor
   - Copy your project URL and anon key from Project Settings > API

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your credentials:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter API (Access to generic, llama, etc.)
- **Icons**: Lucide React

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- 🟢 Vercel
- 🔵 Netlify
- 🖥️ Self-hosting

## 📚 Documentation

- `schema.sql` - Database schema for Supabase
- `DEPLOYMENT.md` - Complete deployment guide
- `.env.example` - Environment variables template

## 🔧 Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.
