# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Push Code to Git Repository
```bash
cd "d:\Inventory management\InventoryManagement"
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

## Step 2: Import Project to Vercel
1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the repository containing your inventory management app

## Step 3: Configure Build Settings
Vercel should auto-detect settings from `vercel.json`, but verify:
- **Framework Preset**: Other
- **Build Command**: `expo export -p web`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Step 4: Add Environment Variables
In Vercel project settings → Environment Variables, add:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDcAftDOiXxwML05rN98FNvnX5WTjDkKWw
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=inventorymanagement-9944b.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=inventorymanagement-9944b
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=inventorymanagement-9944b.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=482249261984
EXPO_PUBLIC_FIREBASE_APP_ID=1:482249261984:web:765a6fb56ddf2514be5ac5
```

**Note**: These are your current Firebase credentials. For production, consider creating a separate Firebase project.

## Step 5: Deploy
Click **Deploy** button in Vercel

## Step 6: Update Firebase Authorized Domains
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **inventorymanagement-9944b**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your Vercel domain (e.g., `your-app.vercel.app`)

## Step 7: Test Deployment
Visit your Vercel URL and test:
- Login/Register functionality
- Dashboard loads correctly
- Products CRUD operations
- Transactions work
- All pages are accessible

## Automatic Deployments
Every push to your main branch will trigger automatic deployment on Vercel.

## Custom Domain (Optional)
1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Add custom domain to Firebase Authorized domains

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase authorized domains include Vercel URL
- Ensure Firestore security rules are published

### Routing Issues
- The `vercel.json` rewrites handle client-side routing
- All routes redirect to `index.html` for SPA behavior

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| EXPO_PUBLIC_FIREBASE_API_KEY | Firebase API Key | Yes |
| EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN | Firebase Auth Domain | Yes |
| EXPO_PUBLIC_FIREBASE_PROJECT_ID | Firebase Project ID | Yes |
| EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET | Firebase Storage Bucket | Yes |
| EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | Firebase Messaging Sender ID | Yes |
| EXPO_PUBLIC_FIREBASE_APP_ID | Firebase App ID | Yes |

## Security Notes
- Never commit `.env` file to Git (already in `.gitignore`)
- Use environment variables for all sensitive data
- Consider using different Firebase projects for dev/staging/production
- Regularly rotate API keys and credentials
