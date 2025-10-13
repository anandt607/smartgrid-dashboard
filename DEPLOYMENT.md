# Deployment Guide

This guide covers deploying SmartGrid to various platforms.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase database tables created
- [ ] Supabase RLS policies enabled
- [ ] Production build tested locally (`npm run build && npm start`)
- [ ] No console errors or warnings
- [ ] All features tested
- [ ] Security audit completed

## Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
cd smartgrid-dashboard
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- What's your project's name? **smartgrid-dashboard**
- In which directory is your code located? **.**
- Want to override the settings? **No**

### Step 3: Add Environment Variables

Go to your Vercel dashboard:

1. Select your project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

### Step 4: Redeploy

```bash
vercel --prod
```

Your app is now live! 🎉

## Deploy to Netlify

### Using Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Using Netlify UI

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variables
6. Click "Deploy site"

## Deploy to AWS Amplify

### Step 1: Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
```

### Step 2: Initialize Amplify

```bash
amplify init
```

### Step 3: Add Hosting

```bash
amplify add hosting
```

### Step 4: Deploy

```bash
amplify publish
```

## Deploy with Docker

### Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build image
docker build -t smartgrid-dashboard .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  smartgrid-dashboard
```

## Deploy to DigitalOcean App Platform

1. Create a DigitalOcean account
2. Go to **App Platform**
3. Click "Create App"
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
6. Add environment variables
7. Click "Create Resources"

## Environment Variables

### Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Optional

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

## Custom Domain Setup

### Vercel

1. Go to project **Settings** → **Domains**
2. Add your domain
3. Update DNS records as instructed
4. Wait for DNS propagation (can take up to 24 hours)

### Netlify

1. Go to **Domain settings**
2. Add custom domain
3. Configure DNS:
   - Add A record pointing to Netlify's IP
   - Or add CNAME record

## SSL/HTTPS

All recommended platforms (Vercel, Netlify, AWS Amplify) provide automatic SSL certificates via Let's Encrypt.

## Database Configuration

### Supabase Production Setup

1. Ensure connection pooling is enabled
2. Set up database backups (automatic in Supabase)
3. Enable Point-in-Time Recovery (PITR) for paid plans
4. Review and optimize RLS policies
5. Set up monitoring and alerts

### Connection Limits

Supabase Free Tier:
- Max connections: 60
- Connection pooler: Yes

Consider upgrading for production workloads.

## Monitoring

### Vercel Analytics

Enable in project settings:
- Real user monitoring
- Web vitals tracking
- Error tracking

### Supabase Monitoring

Built-in dashboard shows:
- API requests
- Database connections
- Storage usage
- Auth activity

### Third-Party Options

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: User analytics
- **Mixpanel**: Product analytics

## Performance Optimization

### Build Optimization

```json
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    domains: ['your-cdn.com'],
    minimumCacheTTL: 31536000,
  },
}
```

### Caching Strategy

- Static assets: Cache-Control: public, max-age=31536000
- API responses: Cache-Control: s-maxage=10, stale-while-revalidate
- Images: CDN with long cache times

### CDN Configuration

Use Vercel's Edge Network (automatic) or configure your own:
- CloudFlare
- AWS CloudFront
- Fastly

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] RLS enabled on all Supabase tables
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] CSP headers configured
- [ ] Dependency security audit: `npm audit`
- [ ] Regular security updates scheduled

## Backup Strategy

### Database Backups

Supabase provides:
- Daily backups (automatic)
- Point-in-time recovery (paid plans)
- Manual backup option

### Code Backups

- Git repository (primary)
- GitHub/GitLab (remote)
- Local backups recommended

## Rollback Strategy

### Vercel

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Git-Based Platforms

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard [commit-hash]
git push -f origin main
```

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Post-Deployment

### 1. Test Everything

- [ ] Authentication flow
- [ ] All pages load correctly
- [ ] API endpoints working
- [ ] Images loading
- [ ] Forms submitting
- [ ] Database operations
- [ ] Payment flow (if applicable)

### 2. Set Up Monitoring

- Error tracking (Sentry)
- Uptime monitoring (UptimeRobot)
- Performance monitoring (Vercel Analytics)

### 3. Configure Alerts

- Database errors
- High error rates
- Performance degradation
- Downtime alerts

### 4. Documentation

- Document deployment process
- Update README with production URL
- Create runbook for common issues

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables Not Working

- Check variable names match exactly
- Prefix client-side vars with `NEXT_PUBLIC_`
- Redeploy after changing variables

### Database Connection Issues

- Verify Supabase URL and key
- Check connection limits
- Review RLS policies
- Check network/firewall settings

### Slow Performance

- Enable CDN
- Optimize images
- Review query performance
- Check bundle size
- Enable caching

## Cost Estimation

### Vercel (Hobby Plan)

- Free: 100 GB bandwidth
- $20/month: Pro plan with more resources

### Supabase (Free Tier)

- Free: 500 MB database, 1 GB file storage
- $25/month: Pro plan with more resources

### Total Monthly Cost

- **Hobby Project**: $0 (free tiers)
- **Small Business**: $50-100/month
- **Growing Startup**: $200-500/month

## Scaling Considerations

### When to Scale

- Response time > 3 seconds
- Error rate > 1%
- Database CPU > 80%
- Storage > 80% capacity

### Scaling Options

1. **Vertical Scaling**: Upgrade plan
2. **Horizontal Scaling**: Add regions (Vercel Edge)
3. **Database Scaling**: Supabase Pro/Enterprise
4. **Caching**: Redis, CDN
5. **Code Optimization**: Review queries, bundle size

## Support

For deployment issues:
- Check platform documentation
- Contact platform support
- Review deployment logs
- Ask in community forums

---

**Good luck with your deployment!** 🚀
