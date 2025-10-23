# Application Routes Reference

## 🌐 Public Routes (No Authentication Required)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Main landing page with app description and CTAs |
| `/login` | Login | Login page for admin and agent users |
| `/player/new-transaction` | New Transaction | Multi-step wizard for creating transactions (players) |
| `/player/history` | Player History | View transaction history (anonymous with player UUID) |
| `/player/transaction/:id` | Transaction Details | View specific transaction details (player view) |

## 🔐 Admin Routes (Admin Role Required)

### Dashboard & Transactions
| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Admin Dashboard | Overview with stats, charts, and transaction management |
| `/admin/transaction/:id` | Transaction Details | Detailed view of a specific transaction (admin view) |

### Configuration Management
| Route | Page | Description |
|-------|------|-------------|
| `/admin/deposit-banks` | Deposit Banks | Manage deposit bank accounts (CRUD) |
| `/admin/withdrawal-banks` | Withdrawal Banks | Manage withdrawal bank configurations (CRUD) |
| `/admin/templates` | Templates | Manage message templates for different languages (CRUD) |
| `/admin/languages` | Languages | Manage supported languages (CRUD) |
| `/admin/agents` | Agents | View all agents with their statistics |

## 👤 Agent Routes (Agent Role Required)

| Route | Page | Description |
|-------|------|-------------|
| `/agent` | Agent Dashboard | View assigned tasks with filters |
| `/agent/task/:id` | Task Details | Process assigned transaction (accept, mark success/fail) |

## 🔑 Shared Protected Routes (Admin & Agent)

| Route | Page | Description |
|-------|------|-------------|
| `/change-password` | Change Password | Change user password (requires current password) |

## 📊 API Endpoints Integration

### Authentication API
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/logout` - User logout

### Public/Config API
- `GET /api/v1/config/welcome?lang={code}` - Get welcome message
- `GET /api/v1/config/deposit-banks` - Get active deposit banks
- `GET /api/v1/config/withdrawal-banks` - Get active withdrawal banks
- `GET /api/v1/config/languages` - Get active languages

### Player API
- `POST /api/v1/players` - Create player profile
- `GET /api/v1/players/{uuid}` - Get player by UUID
- `PUT /api/v1/players/{uuid}` - Update player profile

### Transaction API
- `POST /api/v1/transactions` - Create transaction (with file upload)
- `GET /api/v1/transactions?playerUuid={uuid}` - Get player transactions
- `GET /api/v1/transactions/{id}?player_uuid={uuid}` - Get transaction details

### Admin API - Transactions
- `GET /api/v1/admin/transactions?page={p}&limit={l}&status={s}&type={t}` - Get all transactions with filters
- `PUT /api/v1/admin/transactions/{id}/assign` - Assign transaction to agent
- `PUT /api/v1/admin/transactions/{id}/status` - Update transaction status

### Admin API - Configuration
- `GET /api/v1/admin/deposit-banks` - Get all deposit banks
- `POST /api/v1/admin/deposit-banks` - Create deposit bank
- `PUT /api/v1/admin/deposit-banks/{id}` - Update deposit bank
- `DELETE /api/v1/admin/deposit-banks/{id}` - Delete deposit bank

- `GET /api/v1/admin/withdrawal-banks` - Get all withdrawal banks
- `POST /api/v1/admin/withdrawal-banks` - Create withdrawal bank
- `PUT /api/v1/admin/withdrawal-banks/{id}` - Update withdrawal bank
- `DELETE /api/v1/admin/withdrawal-banks/{id}` - Delete withdrawal bank

- `GET /api/v1/admin/templates` - Get all templates
- `POST /api/v1/admin/templates` - Create template
- `PUT /api/v1/admin/templates/{id}` - Update template
- `DELETE /api/v1/admin/templates/{id}` - Delete template

- `GET /api/v1/admin/languages` - Get all languages
- `POST /api/v1/admin/languages` - Create language
- `PUT /api/v1/admin/languages/{id}` - Update language
- `DELETE /api/v1/admin/languages/{id}` - Delete language

- `GET /api/v1/admin/agents` - Get agents with statistics

### Agent API
- `GET /api/v1/agent/tasks?status={s}&page={p}&limit={l}` - Get assigned tasks
- `PUT /api/v1/agent/transactions/{id}/process` - Process transaction
- `POST /api/v1/agent/evidence` - Upload evidence file
- `GET /api/v1/agent/stats` - Get agent statistics

### Upload API
- `POST /api/v1/uploads` - Upload file
- `GET /api/v1/uploads/config` - Get upload configuration
- `DELETE /api/v1/uploads/{filename}` - Delete file

### System API
- `GET /health` - Health check
- `GET /api/v1/metrics` - Get system metrics (admin only)

## 🎯 Navigation Structure

### Admin Navigation Menu
```
Header
├── Logo
├── Dashboard
├── Configuration ▼
│   ├── Deposit Banks
│   ├── Withdrawal Banks
│   ├── Templates
│   ├── Languages
│   └── Agents
└── User Profile ▼
    ├── Change Password
    └── Logout
```

### Agent Navigation Menu
```
Header
├── Logo
├── My Tasks
└── User Profile ▼
    ├── Change Password
    └── Logout
```

## 🔒 Route Protection

### Public Routes
- No authentication required
- Accessible to everyone
- Player features use UUID-based access

### Admin Routes
- Requires authentication with `role: 'admin'`
- Protected by `ProtectedRoute` component
- Redirects to login if not authenticated or wrong role

### Agent Routes
- Requires authentication with `role: 'agent'`
- Protected by `ProtectedRoute` component
- Redirects to login if not authenticated or wrong role

### Shared Routes
- Requires authentication (any role)
- Accessible by both admins and agents

## 🚀 Quick Start

### Testing Admin Features
1. Navigate to `http://localhost:5173/login`
2. Login with admin credentials
3. Access configuration via header dropdown
4. Test CRUD operations on any configuration page

### Testing Agent Features
1. Navigate to `http://localhost:5173/login`
2. Login with agent credentials
3. View tasks on dashboard
4. Click on a task to process it

### Testing Player Features
1. Navigate to `http://localhost:5173/player/new-transaction`
2. Follow the wizard to create a transaction
3. View transaction history at `/player/history`
4. Access specific transactions via the history page

## 📱 Mobile Navigation

On mobile devices (< 768px width):
- Navigation menus are hidden
- User can still access routes via direct URLs
- All pages are fully responsive
- Forms and tables adapt to smaller screens

## 🎨 UI States

Each page handles:
- ✅ Loading states (skeleton loaders, spinners)
- ✅ Error states (error messages, retry buttons)
- ✅ Empty states (no data messages)
- ✅ Success states (confirmation messages)

## 💡 Tips

1. **Bookmark frequently used routes** for quick access
2. **Use browser back button** to navigate between pages
3. **Check URL for active route** - header highlights current location
4. **Use keyboard shortcuts** - Tab to navigate, Enter to submit forms
5. **Mobile users** - Use the menu button (☰) when available

## 🆘 Troubleshooting

**Route not found?**
- Check if you're logged in
- Verify you have the correct role (admin/agent)
- Clear browser cache and reload

**Can't access admin pages?**
- Ensure you're logged in as admin
- Check access token is valid
- Try logging out and back in

**Page loads but no data?**
- Check backend is running
- Verify API connection
- Look for errors in browser console

---

**Note**: All routes are defined in `src/routes/AppRoutes.tsx`. Protected routes use `ProtectedRoute` component for role-based access control.

