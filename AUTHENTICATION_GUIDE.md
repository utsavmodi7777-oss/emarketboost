# 🔒 Authentication & Protected Routes Guide

## Overview

The platform now has **comprehensive authentication protection**. All services and features require users to login before accessing them. Unauthenticated users are automatically redirected to the login page.

---

## 🛡️ Protected Routes System

### What's Protected?

#### ✅ **Fully Protected** (Login Required)
- User Dashboard (`/user`, `/dashboard`)
- Campaign Creation (`/campaign/create`)
- Profile Pages (`/profile`)
- Products Management (`/products`, `/products/create`)
- Ads Management (`/ads`, `/ads/create`)
- Marketing Campaigns (`/campaigns`, `/campaigns/create`)
- Analytics Dashboard (`/analytics`)
- Subscription Management (`/subscription/checkout/*`, `/subscription/manage`)
- Notifications (`/notifications`)
- Integrations (`/integrations`)
- Profile Setup (`/profile-setup`)

#### ✅ **Role-Based Protected**
- **User Panel** (`/user/*`) - Requires `user` role
- **Service Panel** (`/service/*`) - Requires `service` role
- **Admin Panel** (`/admin/*`) - Requires `admin` role

#### 🌐 **Public** (No Login Required)
- Homepage (`/`)
- Login/Signup (`/auth`)
- Admin Login (`/admin/login`)
- Service Login (`/service/login`)
- Marketing Pages (`/pricing`, `/blog`, `/case-studies`)
- Service Description Pages (`/services/*`)
- Subscription Plans Page (`/subscription`)

---

## 🔄 How It Works

### 1. **Access Protected Page Without Login**
```
User visits: /campaign/create
↓
System checks: Is user authenticated?
↓
NO → Redirect to: /auth
↓
Show message: "Please login to access this page"
↓
User logs in
↓
Redirect back to requested page
```

### 2. **Access Wrong Role Page**
```
User (role: user) visits: /admin
↓
System checks: Does user have admin role?
↓
NO → Redirect to appropriate dashboard
↓
User Dashboard (/user)
```

### 3. **Access Public Page**
```
User visits: /pricing
↓
No authentication check
↓
Page loads immediately
```

---

## 🔧 Implementation Details

### Protected Route Component

Located: `src/components/ProtectedRoute.tsx`

**Usage:**
```tsx
<Route 
  path="/user/dashboard" 
  element={
    <ProtectedRoute requiredRole="user">
      <UserDashboard />
    </ProtectedRoute>
  } 
/>
```

**Props:**
- `children` - Component to protect
- `requiredRole` - Optional: "user", "service", or "admin"
- `redirectTo` - Optional: Custom redirect URL (default: "/auth")

### Auth Check Button

Located: `src/components/AuthCheckButton.tsx`

**Usage in Service Pages:**
```tsx
import { AuthCheckButton } from "@/components/AuthCheckButton";

<AuthCheckButton 
  serviceName="Ad Campaigns"
  className="bg-primary hover:bg-primary/90"
/>
```

**Behavior:**
- If **logged in**: Shows "Access [Service]" → Goes to service
- If **not logged in**: Shows "Get Started - Login Required" → Goes to login

---

## 📝 User Experience Flow

### Scenario 1: New User Wants to Create Campaign

1. User browses website (not logged in)
2. Clicks "Create Campaign" button
3. **Redirected to:** `/auth`
4. **Sees message:** "Please login to access this page"
5. User signs up or logs in
6. **Auto-redirected to:** Campaign creation page
7. Can now create campaigns

### Scenario 2: User Tries Direct URL Access

1. User types: `http://localhost:5173/analytics`
2. **System checks:** Authentication status
3. **Not logged in** → Redirect to `/auth`
4. **Sees message:** "Please login to access this page"
5. User must login to proceed

### Scenario 3: Service Employee Access

1. Employee visits: `/service`
2. **System checks:** Is authenticated AND has service role?
3. **Not authenticated** → Redirect to `/service/login`
4. **Wrong role** → Redirect to appropriate panel
5. **Correct role** → Access granted

---

## 🎨 Visual Indicators

### Login Page Alert
When redirected, users see an orange alert box:
```
┌─────────────────────────────────────┐
│ 🔔 Please login to access this page │
└─────────────────────────────────────┘
```

### Button States

**Not Logged In:**
```
[Get Started - Login Required]
```

**Logged In:**
```
[Access Service]
```

---

## 🔐 Authentication Flow

### User Authentication
```
Sign Up → Email Confirmation → Profile Setup → Dashboard
    ↓
  Login → Session Created → Dashboard
```

### Service Authentication
```
New Employee → Register → Employee ID Generated → Login
    ↓
Manager/Employee Login → Service Dashboard
```

### Admin Authentication
```
Admin Login → Role Verification → Admin Dashboard
```

---

## 🛠️ Developer Guide

### Adding a New Protected Route

**Method 1: Using ProtectedRoute Component**
```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

<Route 
  path="/new-feature" 
  element={
    <ProtectedRoute>
      <NewFeature />
    </ProtectedRoute>
  } 
/>
```

**Method 2: Using useRequireAuth Hook**
```tsx
import { useRequireAuth } from "@/components/ProtectedRoute";

function MyComponent() {
  const { isAuthenticated, loading } = useRequireAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;
  
  return <div>Protected Content</div>;
}
```

### Adding Auth Check to Service Pages

```tsx
import { AuthCheckButton } from "@/components/AuthCheckButton";

<AuthCheckButton 
  serviceName="Your Service Name"
  className="your-custom-classes"
/>
```

### Programmatic Auth Check

```tsx
import { requireAuth } from "@/components/AuthCheckButton";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

async function handleAction() {
  const isAuth = await requireAuth(
    navigate, 
    "Please login to perform this action"
  );
  
  if (!isAuth) return;
  
  // Proceed with authenticated action
}
```

---

## 🔄 Redirect Patterns

### Standard Redirects

| From | To | Role Required |
|------|-----|---------------|
| `/user/*` | `/auth` | user |
| `/service/*` | `/service/login` | service |
| `/admin/*` | `/admin/login` | admin |
| Any protected | `/auth` | any |

### Role-Based Redirects

If user has **wrong role**:
- Admin → `/admin`
- Service → `/service`
- User → `/user`

---

## ✅ Testing Checklist

### Authentication Protection
- [ ] Cannot access `/user` without login
- [ ] Cannot access `/service` without login
- [ ] Cannot access `/admin` without login
- [ ] Cannot create campaigns without login
- [ ] Cannot access analytics without login
- [ ] Cannot access profile without login

### Redirect Functionality
- [ ] Redirects to `/auth` when accessing protected route
- [ ] Shows appropriate message on redirect
- [ ] Returns to requested page after login
- [ ] Redirects to correct dashboard based on role

### Public Access
- [ ] Can access homepage without login
- [ ] Can access pricing page without login
- [ ] Can view service descriptions without login
- [ ] Can see subscription plans without login

### Role Verification
- [ ] User cannot access service panel
- [ ] User cannot access admin panel
- [ ] Service cannot access admin panel
- [ ] Admin can access any panel

---

## 🔍 Debugging

### User Can't Access Page

**Check:**
1. Is user logged in? `supabase.auth.getSession()`
2. Does user have correct role in database?
3. Is route wrapped in `<ProtectedRoute>`?
4. Check browser console for errors

### Infinite Redirect Loop

**Common Causes:**
1. Protected route redirecting to another protected route
2. Auth check on login page itself
3. Missing session data

**Solution:**
- Ensure public pages are NOT wrapped in ProtectedRoute
- Check redirect logic doesn't create loops

### Role Check Not Working

**Check:**
1. Profile table has correct role value
2. RLS policies allow reading profile
3. useAuth hook is loading profile correctly

---

## 📊 Current Route Protection Status

```
✅ Fully Protected: 15+ routes
✅ Role-Protected: 3 panels (user, service, admin)
✅ Public: 10+ routes
✅ Auth Check Buttons: Ready to use in service pages
✅ Redirect Messages: Implemented
✅ Loading States: Handled
```

---

## 🎯 Best Practices

1. **Always wrap protected routes** in `<ProtectedRoute>`
2. **Use role-based protection** for panel-specific pages
3. **Add helpful messages** when redirecting users
4. **Handle loading states** to prevent flickering
5. **Test all access patterns** (logged in, logged out, wrong role)
6. **Keep public pages accessible** for SEO and user discovery

---

## 📞 Common Issues & Solutions

### Issue: "Page keeps redirecting to login"
**Solution:** Page might be wrapped in ProtectedRoute but shouldn't be. Check if it should be public.

### Issue: "Can't access page after login"
**Solution:** Check if profile has been created. Run profile setup if needed.

### Issue: "Wrong dashboard after login"
**Solution:** Role might be incorrect in database. Verify profile.role value.

### Issue: "Button doesn't show"
**Solution:** Import AuthCheckButton correctly and ensure it's placed in component.

---

## 🎉 Summary

Your platform now has:
- ✅ Complete authentication protection
- ✅ Role-based access control
- ✅ Automatic redirects to login
- ✅ User-friendly error messages
- ✅ Flexible protection system
- ✅ Easy-to-use components

**All services are now protected and require authentication!** 🔒
