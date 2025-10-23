# Comprehensive Testing Guide

## 🧪 Testing All New Features

This guide will help you test every feature that was added to complete the frontend implementation.

## 📋 Pre-Testing Checklist

- [ ] Backend API is running on `http://localhost:3000`
- [ ] Frontend dev server is running on `http://localhost:5173`
- [ ] Database is seeded with admin and agent users
- [ ] You have access to test credentials

### Test Credentials

**Admin User:**
```
Username: admin@example.com
Password: AdminPass123!
```

**Agent User:**
```
Username: agent@example.com
Password: AgentPass123!
```

## 🔐 1. Authentication & User Management

### Test Change Password (Admin)
1. Login as admin
2. Click on your profile name in the header
3. Select "Change Password"
4. Fill in the form:
   - Current Password: `AdminPass123!`
   - New Password: `NewPass123!`
   - Confirm: `NewPass123!`
5. Click "Change Password"
6. **Expected**: Success message, redirect to dashboard
7. Logout and login with new password
8. **Expected**: Login successful
9. Change password back to original

### Test Change Password (Agent)
1. Login as agent
2. Click on your profile name in the header
3. Select "Change Password"
4. Follow same steps as admin
5. **Expected**: Same behavior as admin

### Test Password Validation
1. Go to change password page
2. Try to submit with:
   - Wrong current password → **Expected**: Error
   - Password less than 8 chars → **Expected**: Validation error
   - Mismatched passwords → **Expected**: Validation error

## 🏦 2. Deposit Banks Management

### Test View Deposit Banks
1. Login as admin
2. Navigate to Configuration → Deposit Banks
3. **Expected**: See list of all deposit banks in a table
4. **Check**: ID, Bank Name, Account Number, Account Name, Status, Actions

### Test Create Deposit Bank
1. Click "Add Bank" button
2. Fill in the form:
   - Bank Name: `Test Bank`
   - Account Number: `1234567890`
   - Account Name: `Test Account`
   - Notes: `Test notes`
   - Active: ✓ (checked)
3. Click "Create"
4. **Expected**: 
   - Modal closes
   - New bank appears in table
   - Success feedback (implicitly via refresh)

### Test Edit Deposit Bank
1. Click the edit icon (✏️) on any bank
2. Modify fields (e.g., change bank name)
3. Click "Update"
4. **Expected**: 
   - Modal closes
   - Changes reflected in table
   - Bank updates immediately

### Test Delete Deposit Bank
1. Click the delete icon (🗑️) on test bank
2. **Expected**: Confirmation modal appears
3. Click "Delete"
4. **Expected**: 
   - Confirmation modal closes
   - Bank removed from table

### Test Form Validation
1. Click "Add Bank"
2. Try to submit empty form
3. **Expected**: Validation errors for required fields
4. Fill only some fields
5. **Expected**: Errors only for missing required fields

## 💰 3. Withdrawal Banks Management

### Test View Withdrawal Banks
1. Navigate to Configuration → Withdrawal Banks
2. **Expected**: See list with bank names, required fields, status

### Test Create Withdrawal Bank
1. Click "Add Bank"
2. Fill in basic info:
   - Bank Name: `PayPal`
   - Notes: `PayPal withdrawals`
   - Active: ✓
3. Configure required fields:
   - Field 1:
     - Name: `email`
     - Label: `Email Address`
     - Type: `email`
     - Required: ✓
   - Click "Add Field"
   - Field 2:
     - Name: `phone`
     - Label: `Phone Number`
     - Type: `text`
     - Required: ✓
4. Click "Create"
5. **Expected**: 
   - Bank created with 2 required fields
   - Table shows "Email Address, Phone Number" in Required Fields column

### Test Edit Withdrawal Bank
1. Click edit on the PayPal bank
2. Modify field labels
3. Add another field
4. Remove a field (click 🗑️ on field row)
5. Click "Update"
6. **Expected**: Changes saved correctly

### Test Dynamic Fields
1. Create a bank with 1 field
2. Edit and add 3 more fields
3. **Expected**: All 4 fields saved
4. Edit again and remove 2 fields
5. **Expected**: Only 2 fields remain

### Test Delete Withdrawal Bank
1. Click delete on test bank
2. Confirm deletion
3. **Expected**: Bank removed

## 📄 4. Templates Management

### Test View Templates
1. Navigate to Configuration → Templates
2. **Expected**: See list with ID, Language, Key Name, Content preview

### Test Create Template
1. Click "Add Template"
2. Fill in:
   - Language Code: `en`
   - Key Name: `test_message`
   - Content: `This is a test message for {username}`
3. Click "Create"
4. **Expected**: Template created and visible in table

### Test Edit Template
1. Click edit on test template
2. Modify content:
   - Change to: `Updated message for {username}`
3. Click "Update"
4. **Expected**: Content updated in table (first 50 chars visible)

### Test Delete Template
1. Click delete on test template
2. Confirm deletion
3. **Expected**: Template removed

### Test Content Display
1. Create a template with very long content (> 50 chars)
2. **Expected**: Content truncated with "..." in table view
3. Click edit to see full content
4. **Expected**: Full content visible in textarea

## 🌍 5. Languages Management

### Test View Languages
1. Navigate to Configuration → Languages
2. **Expected**: See list with ID, Code, Name, Status

### Test Create Language
1. Click "Add Language"
2. Fill in:
   - Language Code: `fr`
   - Language Name: `French`
   - Active: ✓
3. Click "Create"
4. **Expected**: 
   - Language created
   - Code displayed in monospace font with border

### Test Edit Language
1. Click edit on French language
2. Try to modify code field
3. **Expected**: Code field is disabled (can't change code)
4. Change name to `Français`
5. Toggle Active off
6. Click "Update"
7. **Expected**: Name updated, status changed to "Inactive"

### Test Delete Language
1. Click delete on test language
2. Confirm deletion
3. **Expected**: Language removed

### Test Validation
1. Try to create language with code < 2 chars
2. **Expected**: Validation error
3. Try code > 5 chars
4. **Expected**: Validation error

## 👥 6. Agents Management

### Test View Agents
1. Navigate to Configuration → Agents
2. **Expected**: See overview cards:
   - Total Agents
   - Total Tasks
   - Pending Tasks
   - Completed Tasks
3. **Expected**: See table with:
   - Agent details (ID, username, email)
   - Statistics (total, pending, processing, success, failed)
   - Success rate percentage

### Test Statistics Display
1. Check if numbers in overview cards match sum of individual agents
2. **Expected**: Total Tasks = sum of all agent totals
3. Check success rate calculation
4. **Expected**: (success / total) * 100 displayed as percentage

### Test Real Data
1. Have an agent process some transactions
2. Refresh agents page
3. **Expected**: Statistics updated to reflect new data

## 🧭 7. Navigation Testing

### Test Admin Dropdown Menu
1. Login as admin
2. Hover over "Configuration" in header
3. **Expected**: Dropdown shows all 5 options with icons
4. Click each option
5. **Expected**: Navigates to correct page
6. Check active state on Dashboard link
7. **Expected**: When on /admin, "Dashboard" is highlighted

### Test User Profile Dropdown
1. Hover over user name in header
2. **Expected**: Dropdown shows:
   - Change Password with lock icon
   - Logout with logout icon
3. Click Change Password
4. **Expected**: Navigate to /change-password
5. Use browser back
6. Click Logout from dropdown
7. **Expected**: Logged out, redirected to /login

### Test Agent Navigation
1. Login as agent
2. **Expected**: Only "My Tasks" link visible
3. **Expected**: No Configuration dropdown
4. User profile dropdown still works
5. **Expected**: Can access Change Password

### Test Mobile Navigation (< 768px)
1. Resize browser to mobile width
2. **Expected**: Navigation menus hidden
3. **Expected**: User dropdown still accessible
4. Click hamburger menu if available
5. Test navigation on mobile

## 🎨 8. UI/UX Testing

### Test Modal Behavior
1. Open any create/edit modal
2. Try to click outside modal
3. **Expected**: Modal closes
4. Open modal again
5. Click "Cancel" button
6. **Expected**: Modal closes, no changes saved
7. Open modal, fill form, submit
8. **Expected**: Modal closes after successful save

### Test Loading States
1. Create an item
2. During save, check button state
3. **Expected**: Button shows loading text and is disabled
4. **Expected**: Can't submit form multiple times

### Test Error Handling
1. Disconnect backend
2. Try to create an item
3. **Expected**: Error message displayed
4. Reconnect backend
5. Retry operation
6. **Expected**: Success

### Test Responsive Tables
1. View any management page on mobile
2. **Expected**: Tables are scrollable horizontally
3. **Expected**: Action buttons still accessible
4. **Expected**: Text doesn't overflow

### Test Status Badges
1. View deposit banks with active and inactive banks
2. **Expected**: Active shown in green
3. **Expected**: Inactive shown in gray
4. **Expected**: Colors match success/secondary theme

## 🔄 9. Data Consistency Testing

### Test Create → Read
1. Create a new deposit bank
2. Refresh page
3. **Expected**: Bank still appears (data persisted)
4. Logout and login again
5. **Expected**: Bank still visible

### Test Update → Read
1. Edit a bank (change name)
2. Refresh page
3. **Expected**: Updated name persists
4. Navigate away and back
5. **Expected**: Changes still visible

### Test Delete → Read
1. Delete a bank
2. Refresh page
3. **Expected**: Bank no longer appears
4. Try to access deleted bank via API
5. **Expected**: 404 or appropriate error

### Test Concurrent Updates
1. Open same management page in two tabs
2. Create item in tab 1
3. Refresh tab 2
4. **Expected**: New item visible in tab 2
5. Delete item in tab 2
6. Refresh tab 1
7. **Expected**: Item gone from tab 1

## 🔐 10. Security Testing

### Test Route Protection
1. Logout
2. Try to navigate to `/admin/deposit-banks`
3. **Expected**: Redirected to /login
4. Login as agent
5. Try to navigate to `/admin/deposit-banks`
6. **Expected**: Redirected (not authorized)
7. Login as admin
8. Navigate to `/admin/deposit-banks`
9. **Expected**: Access granted

### Test API Authorization
1. Open browser DevTools → Network tab
2. Create a deposit bank
3. Check request headers
4. **Expected**: `Authorization: Bearer <token>` present
5. Logout
6. Try to access admin page
7. **Expected**: API calls fail with 401

### Test Password Security
1. Change password form
2. **Expected**: Current password field is type="password"
3. **Expected**: New password field is type="password"
4. **Expected**: Passwords not visible in network requests (check DevTools)

## 📊 11. End-to-End Scenarios

### Scenario 1: Complete Admin Workflow
1. Login as admin
2. Create a deposit bank
3. Create a withdrawal bank with custom fields
4. Create a message template
5. Add a new language
6. Check agents statistics
7. Change your password
8. Logout

### Scenario 2: Configuration Changes
1. Create deposit bank "Bank A"
2. Set as active
3. Create withdrawal bank "Wallet A"
4. Set as active with required email field
5. Create template in English
6. Verify all visible in respective tables
7. Deactivate deposit bank
8. **Expected**: Status changes to inactive
9. Delete all test items

### Scenario 3: Multi-language Setup
1. Add languages: `es`, `fr`, `de`
2. Create template for each language:
   - `es`: `welcome_message` → Spanish text
   - `fr`: `welcome_message` → French text
   - `de`: `welcome_message` → German text
3. **Expected**: All templates created with same key, different languages

## ✅ Test Results Checklist

### Admin Features
- [ ] Can view all deposit banks
- [ ] Can create deposit bank
- [ ] Can edit deposit bank
- [ ] Can delete deposit bank
- [ ] Can view all withdrawal banks
- [ ] Can create withdrawal bank with dynamic fields
- [ ] Can edit withdrawal bank
- [ ] Can delete withdrawal bank
- [ ] Can view all templates
- [ ] Can create template
- [ ] Can edit template
- [ ] Can delete template
- [ ] Can view all languages
- [ ] Can create language
- [ ] Can edit language (name only, code locked)
- [ ] Can delete language
- [ ] Can view agent statistics
- [ ] Statistics calculate correctly

### User Features
- [ ] Admin can change password
- [ ] Agent can change password
- [ ] Password validation works
- [ ] Can logout

### Navigation
- [ ] Admin navigation dropdown works
- [ ] User profile dropdown works
- [ ] Active routes highlighted
- [ ] Mobile navigation collapses
- [ ] Links navigate correctly

### UI/UX
- [ ] Modals open and close
- [ ] Forms validate correctly
- [ ] Loading states appear
- [ ] Error messages display
- [ ] Success feedback provided
- [ ] Tables are responsive
- [ ] Icons display correctly
- [ ] Colors match theme

### Security
- [ ] Routes protected by role
- [ ] Unauthorized access redirects
- [ ] API calls include auth tokens
- [ ] Passwords hidden in forms

## 🐛 Common Issues & Solutions

**Modal won't close:**
- Click Cancel button or click outside modal
- Check browser console for errors

**Form won't submit:**
- Check all required fields filled
- Check validation errors
- Ensure backend is running

**Changes don't save:**
- Check network tab for API errors
- Verify authentication token is valid
- Check backend logs

**Table shows no data:**
- Verify backend has data
- Check API endpoint is correct
- Look for CORS errors

**Navigation doesn't work:**
- Clear browser cache
- Check route definitions
- Verify user role is correct

## 📝 Test Report Template

After testing, document results:

```
Feature: [Feature Name]
Date Tested: [Date]
Tested By: [Your Name]
Browser: [Chrome/Firefox/Safari]
Status: [Pass/Fail]

Test Cases:
1. [Test Case 1]: [Pass/Fail]
2. [Test Case 2]: [Pass/Fail]
...

Issues Found:
- [Issue 1]
- [Issue 2]

Notes:
- [Any additional observations]
```

## 🎯 Success Criteria

All features pass testing when:
- ✅ No console errors
- ✅ All CRUD operations work
- ✅ Data persists correctly
- ✅ UI is responsive
- ✅ Navigation works smoothly
- ✅ Security measures in place
- ✅ Forms validate properly
- ✅ Modals behave correctly

---

**Happy Testing! 🚀**

If you encounter any issues, check the browser console, network tab, and backend logs for detailed error messages.

