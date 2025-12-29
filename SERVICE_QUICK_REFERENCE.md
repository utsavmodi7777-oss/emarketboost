# 🎯 Service Panel - Quick Reference

## Service Account Credentials
```
Email:    service@gmail.com
Password: 7654321
URL:      http://localhost:5173/service/login
```

## Setup (One-Time)

### 1. Create Service Account (Supabase Dashboard)
```
Authentication > Users > Add user
Email:    service@gmail.com
Password: 7654321
☑️ Auto Confirm User
```

### 2. Grant Service Role (SQL Editor)
```sql
UPDATE public.profiles
SET role = 'service', full_name = 'Service Team Manager'
WHERE email = 'service@gmail.com';
```

### 3. Apply Migration
Run the migration in Supabase SQL Editor:
`supabase/migrations/012_service_employees_table.sql`

## Employee Registration

### New Employee Signup
1. Go to: http://localhost:5173/service/login
2. Click **"New Employee"** tab
3. Fill in details:
   - ✅ Name, Email, Phone
   - ✅ Address, City, State
   - ✅ PAN Number (10 chars)
   - ✅ Aadhar Number (12 digits)
   - ✅ Password
4. Submit → Employee ID generated (EMP00001)
5. **SAVE YOUR EMPLOYEE ID!**

### Employee Login
```
Employee ID: EMP00001
Password:    [your password]
```

## Features

### Dashboard Tabs
- **My Campaigns** - Assigned work, status updates, progress notes
- **My Profile** - Employee info, KYC details, contact
- **Performance** - Stats, earnings, success rate

### Campaign Status Flow
```
In Review → Approved → In Progress → Delivered → Completed
```

### Stats Overview
- 📊 Assigned campaigns
- 🔄 In progress count
- ✅ Completed count  
- 💰 Earnings (10% commission)

## Login Methods

**Service Manager:**
- ID: `service@gmail.com` or `service`
- Password: `7654321`

**Employee:**
- ID: `EMP00001` (your generated ID)
- Password: Your password

## Quick Commands

```bash
# Show service setup instructions
npm run setup:service

# Start development server
npm run dev
```

## URLs

| Panel | Login | Dashboard |
|-------|-------|-----------|
| User | `/auth` | `/user` |
| Service | `/service/login` | `/service` |
| Admin | `/admin/login` | `/admin` |

## Employee ID Format

- Auto-generated on registration
- Format: `EMP#####` (e.g., EMP00001, EMP00002)
- Sequential numbering
- Required for employee login

## Database Tables

### service_employees
```
- employee_id (Unique ID)
- full_name
- email
- phone  
- address, city, state
- pan_number
- aadhar_number
- status (active/inactive/on_leave)
- joined_date
```

## Commission Structure

- **Rate:** 10% of campaign total cost
- **Paid on:** Completed campaigns
- **Tracking:** Automatic in Performance tab

## Navigation Links

From any page:
- **User Login** - Main authentication
- **Service Login** - Employee access
- **Admin Login** - Admin panel

---

**Setup Script:** `npm run setup:service`
**Full Guide:** `SERVICE_PANEL_SETUP.md`
