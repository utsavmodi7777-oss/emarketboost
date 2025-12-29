# Service Panel Setup Guide

## 🎯 Service Panel Overview

The Service Panel is designed for company employees and service team members to manage customer campaigns, track their work, and monitor performance.

## 🔐 Access Credentials

### Main Service Account (Manager)
```
Email:    service@gmail.com
Password: 7654321
URL:      http://localhost:5173/service/login
```

### Employee Access
- Employees login with **Employee ID** (auto-generated during signup)
- Example: `EMP00001`, `EMP00002`, etc.

## 🚀 One-Time Setup

### Step 1: Create Main Service Account in Supabase

1. **Go to Supabase Dashboard** → https://app.supabase.com
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Enter:
   - Email: `service@gmail.com`
   - Password: `7654321`
   - ✅ Check "Auto Confirm User"
5. Click **"Create user"**

### Step 2: Grant Service Role

1. Go to **SQL Editor** in Supabase
2. Run this query:

```sql
UPDATE public.profiles
SET role = 'service', full_name = 'Service Team Manager'
WHERE email = 'service@gmail.com';
```

### Step 3: Run Database Migration

The service employees table needs to be created. Run this migration:

```sql
-- This migration is in: supabase/migrations/012_service_employees_table.sql
-- It creates the service_employees table and sets up permissions
```

You can apply it by:
- Running it manually in SQL Editor, OR
- Using Supabase CLI: `supabase db push`

## 👥 Employee Registration

### For New Employees

1. **Navigate to Service Login Page**
   - URL: http://localhost:5173/service/login

2. **Click on "New Employee" Tab**

3. **Fill in Required Information:**
   - Full Name
   - Email (will be used for account creation)
   - Phone Number
   - Address
   - City
   - State
   - PAN Number (10 characters)
   - Aadhar Number (12 digits)
   - Password (min 6 characters)
   - Confirm Password

4. **Submit Registration**
   - Employee ID will be auto-generated (e.g., EMP00001)
   - Save this Employee ID - it's needed for login!

5. **Login**
   - Use generated Employee ID and your password
   - Access your personal service dashboard

## 📊 Service Panel Features

### Dashboard Tabs

#### 1. **My Campaigns**
- View all assigned campaigns
- Update campaign status:
  - In Review
  - Approved
  - In Progress
  - Delivered
  - Completed
- Add progress updates for clients
- See campaign details and budgets
- Track payment status

#### 2. **My Profile**
- View employee information
- Employee ID display
- Contact details
- PAN and Aadhar information
- Join date and status

#### 3. **Performance**
- Completed projects count
- Active projects count
- Success rate percentage
- Earnings breakdown (10% commission)
- Performance metrics

### Statistics Dashboard

The service panel displays:
- **Assigned Campaigns** - Total campaigns assigned to you
- **In Progress** - Currently active work
- **Completed** - Delivered projects
- **Earnings** - Commission earned (10% of completed campaign values)

## 🎨 Features & Capabilities

### Campaign Management
- ✅ View assigned campaigns
- ✅ Update campaign status
- ✅ Add progress notes
- ✅ Track budgets and deadlines
- ✅ Monitor payment status
- ✅ Client information access

### Employee Profile
- ✅ Complete employee information
- ✅ Auto-generated Employee ID
- ✅ KYC details (PAN, Aadhar)
- ✅ Contact information
- ✅ Employment status

### Performance Tracking
- ✅ Project completion stats
- ✅ Success rate calculation
- ✅ Earnings tracking
- ✅ Commission breakdown
- ✅ Performance metrics

## 🔄 Login Methods

### 1. Service Manager Login
```
Employee ID: service@gmail.com  (or just type "service")
Password: 7654321
```

### 2. Employee Login
```
Employee ID: EMP00001  (your generated ID)
Password: [your password]
```

## 📝 Database Structure

### service_employees Table
```sql
- id (UUID)
- user_id (FK to auth.users)
- employee_id (Unique, e.g., EMP00001)
- full_name
- email
- phone
- address
- city
- state
- pan_number
- aadhar_number
- status (active/inactive/on_leave)
- joined_date
- created_at
- updated_at
```

## 🛡️ Security Features

- Role-based access control (service role required)
- Automatic Employee ID generation
- Secure password requirements
- PAN and Aadhar validation
- Auto-logout functionality
- Protected routes

## 💼 Workflow Example

1. **Admin assigns campaign** to service team member
2. **Employee receives notification** of assignment
3. **Employee logs in** to service panel
4. **Views campaign details** in "My Campaigns"
5. **Updates status** as work progresses
6. **Adds progress updates** for client visibility
7. **Marks as completed** when delivered
8. **Earns 10% commission** on completion

## 🎯 Quick Access

| Panel | Login URL | Dashboard URL |
|-------|-----------|---------------|
| User | `/auth` | `/user` |
| Service | `/service/login` | `/service` |
| Admin | `/admin/login` | `/admin` |

## 📱 Navigation

From any page, users can access:
- User Login (main auth page)
- Service Login (employee/service access)
- Admin Login (admin panel)

## ⚙️ Configuration

### Default Commission Rate
Currently set to **10%** of campaign value for completed projects.

To modify, edit the commission calculation in:
`src/pages/service/ServiceDashboardNew.tsx`

```typescript
const totalEarnings = data?.reduce((sum, c) => 
  c.status === "completed" ? sum + (c.total_cost * 0.1) : sum, 0
) || 0; // Change 0.1 to desired percentage
```

## 🔧 Troubleshooting

### Cannot Login as Service
- Verify service@gmail.com exists in Supabase Auth
- Check profile role is 'service'
- Clear browser cache

### Employee ID Not Generated
- Check service_employees table exists
- Verify migration was applied
- Check browser console for errors

### Cannot See Campaigns
- Campaigns must be assigned by admin
- Check campaign_requests table
- Verify assigned_to field matches your user_id

### Profile Not Showing
- Ensure you registered as employee
- Check service_employees table for your record
- Verify user_id matches your auth.users id

## 📚 Additional Resources

- Main service dashboard code: `src/pages/service/ServiceDashboardNew.tsx`
- Authentication page: `src/pages/service/ServiceAuth.tsx`
- Database migration: `supabase/migrations/012_service_employees_table.sql`

## ✅ Testing Checklist

- [ ] Main service account can login
- [ ] New employee can register
- [ ] Employee ID is auto-generated
- [ ] Employee can login with ID
- [ ] Campaigns display correctly
- [ ] Status updates work
- [ ] Progress notes can be added
- [ ] Profile information displays
- [ ] Performance metrics calculate
- [ ] Logout works properly

---

**Status:** ✅ Service Panel Ready!

The service panel is now fully functional. Create the service account in Supabase and start onboarding employees!
