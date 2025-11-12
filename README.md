# SteamLens - AI-Powered Game Discovery Platform

A modern web application for discovering Steam games with AI-powered Q&A and game recommendations.

## Features

- 🔍 Search Steam games
- 🤖 Ask AI questions about games
- 🎮 Get AI-suggested similar games
- 📱 Responsive, modern UI

## Tech Stack

- **Next.js 14** - React framework
- **tRPC** - End-to-end typesafe APIs
- **TanStack Query** - Data fetching
- **Tailwind CSS** - Styling
- **Groq AI** - Free LLM for Q&A and recommendations
- **Steam Web API** - Game data

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory with the following:
   ```env
   STEAM_API_KEY=your_steam_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Get API Keys:**
   - **Steam API Key**: Get one at https://steamcommunity.com/dev/apikey
   - **Groq API Key**: Get one at https://console.groq.com/

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── game/[id]/   # Game detail page
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── providers.tsx # React Query provider
├── components/       # React components
│   ├── game/        # Game-related components
│   └── ai/          # AI-related components
├── server/          # Backend code
│   └── api/         # tRPC routers and services
└── utils/           # Utility functions
```

## Deployment

### Deploy to Vercel (Recommended)

This project is optimized for Vercel deployment. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed step-by-step instructions.

**Quick Steps:**
1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variable: `GROQ_API_KEY` (get one at https://console.groq.com/)
4. Deploy!

The app will automatically:
- Build and deploy on every push to `main`
- Create preview deployments for pull requests
- Handle serverless functions and API routes

**Required Environment Variable:**
- `GROQ_API_KEY` - Your Groq API key for AI features

No other configuration needed - Vercel auto-detects Next.js projects!

## License

MIT

