# 🚀 Vercel Deployment Guide

This guide walks you through deploying the SecureForce application to Vercel with full production setup.

## Prerequisites

Before you begin, ensure you have:
- GitHub account with the repo pushed
- Production Supabase project created
- Vercel account (free tier available)
- Custom domain (optional, but recommended for production)

## Step 1: Prepare Your Repository

### 1.1 Ensure Code is Clean and Committed

```bash
# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

### 1.2 Verify `.env.local` is in `.gitignore`

```bash
# Check if .env.local is in .gitignore
cat .gitignore | grep env.local
```

**Expected output:** `.env.local` should be listed to prevent committing secrets.

## Step 2: Set Up Production Supabase Project

### 2.1 Create Production Project

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project name: `secureforce-production`
4. Select region closest to your users
5. Set database password (save it securely)
6. Click "Create new project"

### 2.2 Run Database Migrations

Once the project is created:

1. Go to SQL Editor in Supabase Dashboard
2. Copy the setup SQL from your local migrations
3. Run the migrations to create tables and RLS policies
4. Seed sample data if needed

### 2.3 Enable Auth

1. Go to Authentication → Providers
2. Email provider should be enabled by default
3. Configure email templates (optional)

### 2.4 Create Storage Buckets

1. Go to Storage
2. Create new bucket: `backups`
   - Make it public: No
3. Create new bucket: `employee-photos`
   - Make it public: Yes (for public URLs)

## Step 3: Connect to Vercel

### 3.1 Create New Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Search for your GitHub repo: `security-manpower-app`
5. Click "Import"

### 3.2 Configure Environment Variables

In the Vercel project settings, add environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**To get these values:**
1. Go to Supabase Project Settings → API
2. Copy the Project URL (NEXT_PUBLIC_SUPABASE_URL)
3. Copy the anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Copy the service_role secret (SUPABASE_SERVICE_ROLE_KEY)

### 3.3 Deployment Settings

- **Framework:** Next.js (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Environment:** Production

Click "Deploy" and wait for the build to complete.

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `secureforce.com`)
4. Choose domain registrar option
5. Follow DNS configuration instructions

### 4.2 Configure Supabase CORS

1. Go to Supabase Project Settings → API
2. Add your production URL to CORS allowed origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
   - `https://yourdomain.vercel.app`

## Step 5: Test Production Deployment

### 5.1 Verify Deployment

1. Click the Vercel deployment URL
2. You should see the login page

### 5.2 Test Authentication

```
Test User Account:
Email: test@example.com
Password: Test123!@#
```

Try to:
- Login with test account
- Create a new employee
- Export data
- Create a backup
- Verify QR code on public page

### 5.3 Monitor Build Logs

If deployment fails:
1. Check Vercel build logs for errors
2. Verify all environment variables are set
3. Check Supabase RLS policies
4. Review Next.js build output

## Step 6: Set Up Monitoring

### 6.1 Enable Vercel Analytics

In Vercel Project Settings:
1. Go to Analytics
2. Enable Web Analytics (free tier available)
3. Configure alerts if desired

### 6.2 Configure Error Tracking (Optional)

For production error monitoring, integrate Sentry:

1. Create [Sentry account](https://sentry.io)
2. Create new project for Next.js
3. Get your Sentry DSN
4. Add to Vercel environment variables: `SENTRY_DSN`
5. Update `lib/error-handler.ts` to send errors to Sentry

### 6.3 Set Up Database Monitoring

In Supabase Dashboard:
1. Go to Reports
2. Enable query performance monitoring
3. Set up slow query alerts if available
4. Monitor storage usage

## Step 7: Post-Deployment Checklist

- [ ] Login works with real users
- [ ] All pages load correctly
- [ ] Database queries work (check performance)
- [ ] File uploads work (photos and backups)
- [ ] Email functionality works (if configured)
- [ ] Export and backup features work
- [ ] QR verification page works publicly
- [ ] Rate limiting is active
- [ ] Session timeout works
- [ ] Error handling shows proper messages
- [ ] Analytics are collecting data

## Troubleshooting

### Build Fails

```bash
# Check Node version (Vercel uses Node 18+)
node --version

# Check if all dependencies are installed
npm install

# Test build locally
npm run build

# Check for TypeScript errors
npm run type-check
```

### Database Connection Issues

1. Verify Supabase credentials are correct
2. Check if RLS policies allow current user
3. Check Supabase query logs for errors
4. Verify Vercel can reach Supabase (check firewall)

### Authentication Not Working

1. Check NEXT_PUBLIC_SUPABASE_URL is correct
2. Verify auth provider is enabled in Supabase
3. Check email configuration (if using email auth)
4. Review Supabase auth logs

### Rate Limiting Blocks Users

If users are getting 429 errors:
1. Increase rate limits in `middleware.ts`
2. Implement Redis-based rate limiting for production
3. Whitelist critical IPs if needed

### Performance Issues

1. Use Vercel Analytics to identify slow pages
2. Check database query performance in Supabase
3. Enable Vercel Edge Middleware for faster geo-routing
4. Consider upgrading Supabase tier if needed

## Maintenance

### Regular Tasks

- **Weekly:** Check error logs and fix issues
- **Monthly:** Review performance metrics
- **Quarterly:** Update dependencies securely

### Data Backup

1. Enable Supabase automatic backups
2. Store backups in secure location
3. Test restore procedure quarterly

### Security Updates

1. Keep dependencies updated: `npm update`
2. Run security audit: `npm audit`
3. Review Supabase security advisories

## Rollback Procedure

If something goes wrong:

1. In Vercel Dashboard, go to Deployments
2. Find the previous working deployment
3. Click the three dots → "Promote to Production"
4. Verify the rollback worked

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Production Supabase project configured
- [ ] CORS configured for production domain
- [ ] Database backups enabled
- [ ] Error tracking configured
- [ ] Monitoring enabled
- [ ] Team access configured in Vercel
- [ ] Custom domain working
- [ ] SSL certificate active
- [ ] Performance metrics acceptable
- [ ] Security headers in place
- [ ] Rate limiting active
- [ ] Session timeout working
- [ ] All integrations tested

## Get Help

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Issues:** Report bugs in the repository

## Success! 🎉

Your SecureForce application is now live in production!

Monitor the logs regularly and keep the system updated for security and performance.
