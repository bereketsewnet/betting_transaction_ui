# 🔧 Troubleshooting Guide

## Common Errors and Solutions

### 1. TypeScript Errors for CSS Modules

**Error:**
```
Cannot find module './Component.module.css' or its corresponding type declarations
```

**Solution:**
The type definitions have been created in `src/types/css-modules.d.ts`. If you still see this error:

1. **Restart TypeScript Server** in your IDE:
   - VSCode: Press `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
   - Cursor: Same as above

2. **Verify tsconfig.json** includes the types:
   ```json
   {
     "include": ["src"],
     "compilerOptions": {
       "types": ["vitest/globals", "@testing-library/jest-dom"]
     }
   }
   ```

3. **Clear TypeScript cache:**
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

---

### 2. Environment Variable Errors

**Error:**
```
Property 'VITE_API_BASE_URL' does not exist on type 'ImportMetaEnv'
```

**Solution:**
The environment variable types are defined in `src/vite-env.d.ts`. To fix:

1. **Ensure `.env` file exists** in project root:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   VITE_SOCKET_URL=http://localhost:3000
   VITE_APP_NAME=Betting Payment Manager
   VITE_APP_VERSION=1.0.0
   VITE_MAX_FILE_SIZE=8388608
   VITE_ALLOWED_FILE_TYPES=image/png,image/jpeg,image/jpg
   VITE_DEFAULT_PAGE_SIZE=10
   ```

2. **Restart dev server** after creating/modifying `.env`:
   ```bash
   # Stop server (Ctrl+C) then restart
   npm run dev
   ```

3. **Check tsconfig.json** includes vite-env.d.ts:
   The `"include": ["src"]` should automatically include it.

---

### 3. Module Resolution Errors

**Error:**
```
Cannot find module '@/components/...' or its corresponding type declarations
```

**Solution:**

1. **Verify path aliases** in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Verify Vite config** has the same alias:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   });
   ```

3. **Restart TypeScript server** (see solution #1)

---

### 4. "padding does not exist" Error on CardContent

**Error:**
```
Property 'padding' does not exist on type 'IntrinsicAttributes & HTMLAttributes<HTMLDivElement>'
```

**Solution:**
This has been fixed! The `CardContent` component now supports the `padding` prop. If you still see this error:

1. **Restart TypeScript server**
2. **Clear build cache:**
   ```bash
   rm -rf dist
   npm run build
   ```

3. **Verify the fix** in `src/components/ui/Card/Card.tsx`:
   ```typescript
   export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
     padding?: 'none' | 'sm' | 'md' | 'lg';
   }
   
   export const CardContent: React.FC<CardContentProps> = ({ ... }) => { ... }
   ```

---

### 5. Build Errors

**Error:**
```
Error: Build failed with X errors
```

**Solutions:**

1. **Clear everything and rebuild:**
   ```bash
   rm -rf node_modules dist .vite
   npm install
   npm run build
   ```

2. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

3. **Check for linting errors:**
   ```bash
   npm run lint
   ```

---

### 6. Vite Dev Server Issues

**Error:**
```
Port 5173 is already in use
```

**Solution:**

1. **Kill the process:**
   ```bash
   # Windows PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

   # Mac/Linux
   lsof -ti:5173 | xargs kill
   ```

2. **Or use a different port:**
   ```bash
   npm run dev -- --port 3001
   ```

---

### 7. Import Errors After Installation

**Error:**
```
Module not found: Can't resolve 'react-hook-form'
```

**Solution:**

1. **Ensure all dependencies are installed:**
   ```bash
   npm install
   ```

2. **Check package.json** has all required dependencies

3. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Quick Fixes Checklist

When you encounter errors, try these steps in order:

### ✅ Step 1: Restart TypeScript Server
- **VSCode/Cursor**: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### ✅ Step 2: Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### ✅ Step 3: Clear Cache
```bash
rm -rf node_modules dist .vite
npm install
```

### ✅ Step 4: Check Environment
```bash
# Ensure .env file exists with all variables
cat .env

# Or create from example
cp .env.example .env
```

### ✅ Step 5: Verify Build
```bash
# Check TypeScript
npx tsc --noEmit

# Check linting
npm run lint

# Try building
npm run build
```

---

## IDE-Specific Issues

### VSCode / Cursor

**Issue: TypeScript not picking up type definitions**

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run: "TypeScript: Reload Project"
3. Run: "Developer: Reload Window"

**Issue: ESLint not working**

1. Install ESLint extension
2. Check `.eslintrc.cjs` exists
3. Reload window

### WebStorm / IntelliJ

**Issue: Cannot resolve path aliases**

1. Right-click `tsconfig.json` → "TypeScript" → "Restart TypeScript Service"
2. File → Invalidate Caches → Restart

---

## Still Having Issues?

### 1. Check Node Version
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### 2. Verify Project Structure
Ensure these files exist:
- ✅ `src/vite-env.d.ts` (environment types)
- ✅ `src/types/css-modules.d.ts` (CSS module types)
- ✅ `src/types/index.ts` (API types)
- ✅ `.env` (environment variables)
- ✅ `tsconfig.json` (TypeScript config)
- ✅ `vite.config.ts` (Vite config)

### 3. Check Console for Errors
```bash
# Development errors
npm run dev

# Build errors
npm run build

# TypeScript errors
npx tsc --noEmit
```

### 4. Verify Dependencies
```bash
# List installed packages
npm list --depth=0

# Check for peer dependency warnings
npm install --legacy-peer-deps
```

---

## Emergency Reset

If nothing works, do a complete reset:

```bash
# 1. Remove everything
rm -rf node_modules package-lock.json dist .vite

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall
npm install

# 4. Try dev server
npm run dev
```

---

## Getting Help

If you're still stuck:

1. **Check the error message carefully** - most errors tell you exactly what's wrong
2. **Read the relevant documentation** in `README.md`
3. **Check the Quick Start guide** in `QUICK_START.md`
4. **Look at working examples** in the codebase

---

**Most Common Solution:** Restart TypeScript Server + Restart Dev Server

This fixes 90% of issues! 🎉

