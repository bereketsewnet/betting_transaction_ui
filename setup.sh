#!/bin/bash

# Betting Payment Manager - Quick Setup Script
# This script will set up your development environment

echo "🚀 Betting Payment Manager - Quick Setup"
echo "========================================"
echo ""

# Step 1: Check Node.js version
echo "📋 Step 1: Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "   Node.js version: $NODE_VERSION"

if [[ "$NODE_VERSION" < "v18" ]]; then
    echo "   ⚠️  Warning: Node.js 18+ is recommended"
else
    echo "   ✅ Node.js version OK"
fi
echo ""

# Step 2: Check if .env exists
echo "📋 Step 2: Checking environment file..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
else
    echo "   ⚠️  .env file not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   ✅ Created .env from .env.example"
        echo "   📝 Please update .env with your backend URL"
    else
        echo "   Creating default .env file..."
        cat > .env << EOL
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME=Betting Payment Manager
VITE_APP_VERSION=1.0.0

# Upload Configuration
VITE_MAX_FILE_SIZE=8388608
VITE_ALLOWED_FILE_TYPES=image/png,image/jpeg,image/jpg

# Pagination Defaults
VITE_DEFAULT_PAGE_SIZE=10
EOL
        echo "   ✅ Created default .env file"
    fi
fi
echo ""

# Step 3: Install dependencies
echo "📋 Step 3: Installing dependencies..."
if [ -d "node_modules" ]; then
    echo "   ℹ️  node_modules exists. Checking for updates..."
    npm install
else
    echo "   📦 Installing packages (this may take a few minutes)..."
    npm install
fi
echo "   ✅ Dependencies installed"
echo ""

# Step 4: Verify type definitions
echo "📋 Step 4: Verifying type definitions..."
if [ -f "src/vite-env.d.ts" ]; then
    echo "   ✅ Environment types exist"
else
    echo "   ⚠️  Environment types missing"
fi

if [ -f "src/types/css-modules.d.ts" ]; then
    echo "   ✅ CSS module types exist"
else
    echo "   ⚠️  CSS module types missing"
fi
echo ""

# Step 5: Check TypeScript
echo "📋 Step 5: Checking TypeScript configuration..."
npx tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ No TypeScript errors"
else
    echo "   ⚠️  TypeScript errors found. Run 'npx tsc --noEmit' to see details"
fi
echo ""

# Summary
echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Ensure backend API is running at http://localhost:3000"
echo "2. Update .env if needed"
echo "3. Run: npm run dev"
echo "4. Open: http://localhost:5173"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Full documentation"
echo "   - QUICK_START.md - Quick start guide"
echo "   - TROUBLESHOOTING.md - Fix common issues"
echo "   - FIXES_APPLIED.md - Recent fixes"
echo ""
echo "🎉 Happy coding!"

