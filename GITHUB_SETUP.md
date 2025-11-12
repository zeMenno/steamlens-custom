# Setting Up GitHub Repository

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `steamlens-custom` (or your preferred name)
3. Choose **Public** or **Private**
4. **DO NOT** check "Initialize this repository with a README" (we already have files)
5. Click **"Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

### If you haven't created the repo yet:
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/steamlens-custom.git
git branch -M main
git push -u origin main
```

### If you already created the repo:
```bash
# Replace YOUR_USERNAME and REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

## Step 3: Verify

Check that the remote is set correctly:
```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/REPO_NAME.git (fetch)
origin  https://github.com/YOUR_USERNAME/REPO_NAME.git (push)
```

## Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### If you need to use SSH instead of HTTPS:
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/REPO_NAME.git
```

