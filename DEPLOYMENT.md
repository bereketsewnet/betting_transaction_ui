# 🚀 Deployment Guide

This guide covers deploying the Betting Payment Manager frontend to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] Environment variables are configured
- [ ] Application builds successfully locally
- [ ] All tests pass
- [ ] Linting passes

## 🌐 Deployment Options

### 1. Vercel (Recommended)

**Pros**: Automatic deployments, fast CDN, free tier, zero configuration

#### Steps:

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Framework preset: Vite
- Root directory: `./`

3. **Configure Environment Variables**
```env
VITE_API_BASE_URL=https://your-api.com/api/v1
VITE_SOCKET_URL=https://your-api.com
VITE_APP_NAME=Betting Payment Manager
```

4. **Deploy**
- Click "Deploy"
- Your app will be live at `https://your-app.vercel.app`

#### Custom Domain

- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

### 2. Netlify

**Pros**: Great for static sites, easy setup, generous free tier

#### Steps:

1. **Create `netlify.toml`**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy via UI**
- Go to [netlify.com](https://netlify.com)
- New site from Git
- Choose your repository
- Build command: `npm run build`
- Publish directory: `dist`

3. **Environment Variables**
- Site settings → Environment variables
- Add all `VITE_*` variables

4. **Deploy**
- Trigger deployment
- Site will be live at `https://your-app.netlify.app`

---

### 3. Cloudflare Pages

**Pros**: Global CDN, unlimited bandwidth, fast

#### Steps:

1. **Connect Repository**
- Go to [pages.cloudflare.com](https://pages.cloudflare.com)
- Create a project
- Connect to Git

2. **Build Settings**
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`

3. **Environment Variables**
- Settings → Environment variables
- Add production variables

4. **Deploy**
- Save and deploy
- Access at `https://your-app.pages.dev`

---

### 4. Docker (Self-Hosted)

**Pros**: Full control, can run anywhere, consistent environments

#### Quick Deploy:

```bash
# 1. Build image
docker build -t betting-payment-web .

# 2. Run container
docker run -d \
  -p 80:80 \
  --name betting-web \
  -e VITE_API_BASE_URL=https://your-api.com/api/v1 \
  -e VITE_SOCKET_URL=https://your-api.com \
  betting-payment-web

# 3. Access at http://your-server-ip
```

#### With Docker Compose:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_BASE_URL=https://your-api.com/api/v1
      - VITE_SOCKET_URL=https://your-api.com
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    restart: unless-stopped
```

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

### 5. AWS S3 + CloudFront

**Pros**: Highly scalable, AWS integration, professional

#### Steps:

1. **Build**
```bash
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://betting-payment-web
aws s3 website s3://betting-payment-web --index-document index.html
```

3. **Upload Files**
```bash
aws s3 sync dist/ s3://betting-payment-web --delete
```

4. **Configure CloudFront**
- Create distribution
- Origin: S3 bucket
- Default root object: `index.html`
- Error pages: 404 → /index.html (for SPA routing)

5. **Invalidate Cache on Deploy**
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

### 6. DigitalOcean App Platform

**Pros**: Simple, managed, good pricing

#### Steps:

1. **Create App**
- Go to [digitalocean.com](https://digitalocean.com)
- Create → Apps
- Connect repository

2. **Configure**
- Build command: `npm run build`
- Output directory: `dist`
- HTTP port: 8080

3. **Environment Variables**
- Add all `VITE_*` variables

4. **Deploy**
- Create resources
- Wait for deployment

---

## 🔒 Production Considerations

### Environment Variables

Always set in production:
```env
VITE_API_BASE_URL=https://api.your-domain.com/api/v1
VITE_SOCKET_URL=https://api.your-domain.com
VITE_APP_NAME=Your App Name
```

### Security Headers

Add to your server/CDN:
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### HTTPS

**Always use HTTPS in production!**

- Vercel/Netlify: Automatic
- Cloudflare: Automatic
- Self-hosted: Use Let's Encrypt

### Performance

1. **Enable Gzip/Brotli compression**
2. **Set cache headers** for static assets
3. **Use CDN** for global distribution
4. **Enable HTTP/2**
5. **Minify assets** (automatic with Vite)

### Monitoring

Consider adding:
- Sentry for error tracking
- Google Analytics for usage
- LogRocket for session replay
- Performance monitoring

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Included)

The project includes `.github/workflows/ci.yml`:

- Runs on push to `main`
- Lints code
- Runs tests
- Builds application
- Creates Docker image

### Auto-Deploy to Vercel

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
```

---

## 🐛 Common Deployment Issues

### Issue: Environment variables not working

**Solution**: Make sure variables start with `VITE_`

```env
✅ VITE_API_BASE_URL=...
❌ API_BASE_URL=...
```

### Issue: 404 on page refresh

**Solution**: Configure SPA routing

**Netlify**: Already handled by `netlify.toml`

**Nginx**:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache** (`.htaccess`):
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Issue: CORS errors

**Solution**: Configure backend CORS to allow your frontend domain

```javascript
// Backend
app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true
}));
```

### Issue: WebSocket connection failed

**Solution**: Ensure Socket.IO URL is correct and backend supports WebSocket

```env
VITE_SOCKET_URL=wss://your-api.com  # Use wss:// for HTTPS
```

---

## 📊 Performance Optimization

### 1. Code Splitting

Already configured! Routes are automatically split.

### 2. Image Optimization

Use next-gen formats:
```javascript
// Use WebP with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="..." />
</picture>
```

### 3. Lazy Loading

```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 4. Bundle Analysis

```bash
npm run build -- --mode analyze
```

---

## ✅ Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] All pages are accessible
- [ ] Login works with backend
- [ ] Transactions can be created
- [ ] Real-time updates work
- [ ] File uploads work
- [ ] All roles (admin, agent) work
- [ ] Responsive on mobile
- [ ] HTTPS is enabled
- [ ] Environment variables are set
- [ ] Error tracking is configured
- [ ] Analytics are working
- [ ] Performance is good (< 3s load time)

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Verify environment variables
3. Test API connection
4. Check network tab in DevTools
5. Review deployment logs

---

**Ready to deploy? Choose your platform and follow the steps above!** 🚀

