# 🚀 Quick Start Guide

Get up and running with the Betting Payment Manager Frontend in 5 minutes!

## ⚡ Prerequisites

- Node.js 18+ installed
- Backend API running at `http://localhost:3000`
- npm or yarn

## 📦 Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Start development server
npm run dev
```

That's it! The app will open at `http://localhost:5173`

## 🎯 First Steps

### 1. Test the Application

Visit `http://localhost:5173` and you should see the landing page.

### 2. Login as Admin

1. Click "Login" or go to `/login`
2. Use credentials:
   - Username: `admin@example.com`
   - Password: `AdminPass123!`
3. You'll be redirected to the Admin Dashboard

### 3. Login as Agent

1. Logout from admin
2. Login with:
   - Username: `agent@example.com`
   - Password: `AgentPass123!`
3. You'll see the Agent Dashboard

### 4. Test Player Flow

1. Logout (if logged in)
2. Go to home page
3. Click "Make a Transaction"
4. Follow the wizard to create a test transaction

## 🎨 Key Features to Test

### Player Features
- ✅ Create deposit transaction (`/player/new-transaction`)
- ✅ Create withdrawal transaction
- ✅ View transaction history (`/player/history`)
- ✅ Check transaction details
- ✅ Upload payment screenshots

### Agent Features  
- ✅ View assigned tasks (`/agent`)
- ✅ Process transactions
- ✅ Upload evidence
- ✅ Add processing notes
- ✅ View statistics

### Admin Features
- ✅ View all transactions (`/admin`)
- ✅ Filter transactions
- ✅ Assign to agents
- ✅ Update transaction status
- ✅ View agent statistics

## 🔧 Common Issues

### Port Already in Use

```bash
# Change port in vite.config.ts or run:
npm run dev -- --port 3001
```

### API Connection Failed

1. Ensure backend is running at `http://localhost:3000`
2. Check `.env` file has correct `VITE_API_BASE_URL`
3. Check browser console for errors

### Can't Login

1. Make sure backend database is seeded
2. Check backend logs for errors
3. Clear browser cache and try again

## 🐳 Docker Quick Start

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at `http://localhost:5173`

## 📝 Development Workflow

```bash
# Make changes to code (hot reload enabled)

# Check for linting errors
npm run lint

# Format code
npm run format

# Run tests
npm test

# Build for production
npm run build
```

## 🎨 Customizing Theme

Edit `src/styles/global.css` to change colors and theme:

```css
:root {
  --color-primary: #000000;      /* Change to your brand color */
  --color-secondary: #ffffff;
  /* ... more variables */
}
```

## 📱 Testing Responsiveness

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different device sizes:
   - Mobile: 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1280px, 1920px

## 🌍 Adding Languages

Edit `src/i18n/index.ts`:

```typescript
const resources = {
  en: { translation: { ... } },
  es: { translation: { ... } },
  fr: { translation: { ... } },  // Add new language
};
```

## 🔐 Security Notes

- Access tokens stored in memory only
- Refresh token in HTTP-only cookie (backend)
- No sensitive data in localStorage
- Auto token refresh on 401

## 📖 Next Steps

1. Read full [README.md](./README.md) for detailed documentation
2. Check [EXAMPLES.md](./EXAMPLES.md) for API usage examples
3. Review backend documentation
4. Explore the codebase structure

## 💡 Tips

- **Use React DevTools** for debugging components
- **Use React Query DevTools** (auto-included in dev mode)
- **Check browser console** for helpful logs
- **Use network tab** to debug API calls

## 🆘 Need Help?

1. Check error messages in browser console
2. Review backend logs
3. Ensure all environment variables are set
4. Try clearing cache: `rm -rf node_modules dist && npm install`

---

Happy coding! 🎉

