# Betting Payment Manager - Web Frontend

A production-ready React + Vite + TypeScript web application for managing betting payment transactions. This frontend application connects to the Betting Payment Manager API and provides interfaces for Players, Agents, and Admins.

## 🚀 Features

### Core Features
- **🎨 Modern UI**: Clean black & white theme with CSS modules
- **📱 Fully Responsive**: Mobile-first design for all device sizes
- **🔐 Role-Based Access**: Separate dashboards for Players, Agents, and Admins
- **🔄 Real-time Updates**: Socket.IO integration for live notifications
- **🌍 Internationalization**: Multi-language support with i18next
- **⚡ Fast & Optimized**: Built with Vite for blazing-fast development and builds
- **🧪 Well Tested**: Comprehensive test suite with Vitest
- **🐳 Docker Ready**: Containerized deployment with Docker and docker-compose

### Player Features
- Create deposit and withdrawal transactions
- Upload payment screenshots
- View transaction history
- Track transaction status in real-time
- Multi-language interface

### Agent Features
- View assigned tasks
- Process transactions
- Upload evidence
- Add processing notes
- Real-time task notifications
- Personal statistics dashboard

### Admin Features
- Comprehensive transaction management
- Assign transactions to agents
- Update transaction statuses
- View agent statistics
- Filter and search transactions
- Real-time dashboard updates

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules (no Tailwind, pure CSS)
- **State Management**: 
  - React Context (Auth)
  - TanStack Query (Server State)
  - Zustand (UI State - ready for use)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.IO Client
- **i18n**: react-i18next
- **Icons**: lucide-react
- **Notifications**: react-hot-toast
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend repository)

## 🚀 Quick Start

### 1. Clone and Install

   ```bash
# Clone the repository
git clone <repository-url>
cd betting_transaction_ui

# Install dependencies
   npm install
   ```

### 2. Configure Environment

   ```bash
# Copy environment example
cp .env.example .env

   # Edit .env with your configuration
   ```

**.env Configuration:**
```env
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
```

### 3. Start Development Server

   ```bash
npm run dev
   ```

The application will be available at `http://localhost:5173`

### 4. Build for Production

   ```bash
npm run build
```

Built files will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t betting-payment-manager-web .

# Run the container
docker run -p 5173:80 betting-payment-manager-web
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
betting-payment-manager-web/
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI/CD
├── public/
│   └── vite.svg                  # Public assets
├── src/
│   ├── api/                      # API client & hooks
│   │   ├── axios.ts             # Axios instance with interceptors
│   │   ├── client.ts            # API functions
│   │   └── hooks.ts             # React Query hooks
│   ├── auth/                     # Authentication
│   │   └── AuthContext.tsx      # Auth provider & hooks
│   ├── components/               # Reusable components
│   │   ├── ui/                  # UI components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Badge/
│   │   │   ├── FileUpload/
│   │   │   └── DataTable/
│   │   ├── Layout/
│   │   │   └── Header.tsx
│   │   ├── StatusBadge/
│   │   └── LanguageSwitcher/
│   ├── hooks/                    # Custom hooks
│   │   └── useSocket.ts         # Socket.IO hook
│   ├── i18n/                     # Internationalization
│   │   └── index.ts             # i18n configuration
│   ├── pages/                    # Page components
│   │   ├── Landing/
│   │   ├── Login/
│   │   ├── Player/
│   │   │   ├── NewTransaction/
│   │   │   ├── PlayerHistory/
│   │   │   └── TransactionDetails/
│   │   ├── Agent/
│   │   │   ├── AgentDashboard/
│   │   │   └── TaskDetails/
│   │   └── Admin/
│   │       ├── AdminDashboard/
│   │       └── TransactionDetails/
│   ├── routes/                   # Routing configuration
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   ├── styles/                   # Global styles
│   │   └── global.css           # CSS variables & theme
│   ├── test/                     # Test files
│   │   ├── setup.ts
│   │   ├── Login.test.tsx
│   │   └── DataTable.test.tsx
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   ├── App.tsx                   # Main App component
│   └── main.tsx                  # Entry point
├── .env.example                  # Environment variables example
├── .eslintrc.cjs                 # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose configuration
├── nginx.conf                    # Nginx configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
└── README.md                     # This file
```

## 🎨 Styling System

The application uses **pure CSS with CSS Modules** (no Tailwind). All theme variables are defined in `src/styles/global.css`.

### Global CSS Variables

```css
/* Colors */
--color-primary: #000000;
--color-secondary: #ffffff;
--color-background: #ffffff;
--color-surface: #f5f5f5;
--color-border: #e0e0e0;

/* Spacing */
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;

/* Typography */
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
```

### Dark Theme Support

Toggle dark theme by adding `data-theme="dark"` to the root element.

## 🔐 Authentication Flow

1. **Login**: User enters credentials
2. **Token Storage**: Access token stored in memory (secure)
3. **Auto Refresh**: Axios interceptor handles token refresh
4. **Logout**: Clears all client state and redirects

### Token Management

- Access token: Stored **in memory only** (not localStorage)
- Refresh token: HTTP-only cookie managed by backend
- Auto-refresh on 401 responses

## 📡 API Integration

All API calls use typed hooks from `@/api/hooks.ts`:

```typescript
// Example: Using API hooks
import { useCreateTransaction, usePlayerTransactions } from '@/api/hooks';

function MyComponent() {
  const createTransaction = useCreateTransaction();
  const { data, isLoading } = usePlayerTransactions(playerUuid, page, limit);

  const handleSubmit = async (formData) => {
    await createTransaction.mutateAsync(formData);
  };

  // ...
}
```

## 🔄 Real-time Updates

Socket.IO integration provides real-time notifications:

```typescript
// Automatically connected when authenticated
// Listens to:
// - transaction:new
// - transaction:assigned  
// - transaction:update
// - admin_notification
// - agent_notification
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📝 Scripts

```bash
# Development
npm run dev              # Start development server

# Building
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier

# Testing
npm test                # Run tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Generate coverage report
```

## 🌍 Internationalization

Add new languages in `src/i18n/index.ts`:

```typescript
const resources = {
  en: { translation: { ... } },
  es: { translation: { ... } },
  // Add more languages
};
```

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
@media (max-width: 768px)   /* Mobile */
@media (max-width: 1024px)  /* Tablet */
@media (min-width: 1025px)  /* Desktop */
```

## 🔒 Security Features

- **HTTPS Only** in production
- **No sensitive data** in localStorage
- **CSRF Protection** via cookies
- **XSS Protection** via React's built-in escaping
- **Security Headers** via Nginx
- **Token Refresh** automatic handling
- **Input Validation** with Zod schemas

## 🚢 Deployment

### Vercel / Netlify / Cloudflare Pages

1. Connect your repository
2. Set environment variables:
   - `VITE_API_BASE_URL`
   - `VITE_SOCKET_URL`
3. Build command: `npm run build`
4. Output directory: `dist`

### Environment Variables

Set these in your deployment platform:

```env
VITE_API_BASE_URL=https://your-api.com/api/v1
VITE_SOCKET_URL=https://your-api.com
VITE_APP_NAME=Betting Payment Manager
```

## 🧑‍💻 Development Tips

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/routes/AppRoutes.tsx`
3. Add protection if needed with `ProtectedRoute`

### Adding New API Endpoints

1. Add function in `src/api/client.ts`
2. Create React Query hook in `src/api/hooks.ts`
3. Use hook in component

### Creating New Components

1. Create folder in `src/components/`
2. Add `.tsx` and `.module.css` files
3. Export from index if needed

## 🐛 Troubleshooting

### API Connection Issues

1. Check `VITE_API_BASE_URL` in `.env`
2. Ensure backend is running
3. Check browser console for errors

### Socket.IO Not Connecting

1. Verify `VITE_SOCKET_URL` is correct
2. Check backend Socket.IO configuration
3. Ensure authentication token is valid

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 💬 Support

For issues and questions:
- Check the backend API documentation
- Review `EXAMPLES.md` for API usage examples
- Check test files for component examples

## 🎯 Default Credentials

For testing purposes (from backend seeds):

- **Admin**: `admin@example.com` / `AdminPass123!`
- **Agent**: `agent@example.com` / `AgentPass123!`

---

**Built with ❤️ for the betting industry**

