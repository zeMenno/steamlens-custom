# Deploying SteamLens to Vercel

This guide will walk you through deploying your SteamLens application to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (sign up at https://vercel.com - it's free)
3. Your Groq API key (get one at https://console.groq.com/)

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Import Project to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project

### 3. Configure Build Settings

Vercel should auto-detect these settings, but verify:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 4. Add Environment Variables

Before deploying, add your environment variables:

1. In the Vercel project settings, go to **"Environment Variables"**
2. Add the following variable:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `GROQ_API_KEY` | Your Groq API key | Production, Preview, Development |

   **Note**: You can add it to all environments (Production, Preview, Development) or just Production.

3. Click **"Save"**

### 5. Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://your-project.vercel.app`

### 6. Verify Deployment

1. Visit your deployment URL
2. Try searching for a game
3. Check that AI features work (they require the GROQ_API_KEY)

## Environment Variables

### Required

- **`GROQ_API_KEY`**: Your Groq API key for AI features
  - Get one at: https://console.groq.com/
  - Used for: AI chat and similar game suggestions

### Optional

- **`NODE_ENV`**: Automatically set by Vercel (production)
- **`VERCEL_URL`**: Automatically set by Vercel (your deployment URL)

## Post-Deployment

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

### Monitoring

- View deployment logs in the Vercel dashboard
- Check function logs for API errors
- Monitor usage in the Vercel dashboard

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)

### Environment Variables Not Working

- Make sure variables are added to the correct environment
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### API Errors

- Verify `GROQ_API_KEY` is set correctly
- Check Vercel function logs for detailed error messages
- Ensure API key has proper permissions

### Images Not Loading

- Steam CDN images should work automatically
- Check `next.config.js` has correct `remotePatterns` configured

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

Each deployment gets a unique URL for testing.

## Cost

Vercel's free tier includes:
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions (generous limits)

For most projects, the free tier is sufficient!

