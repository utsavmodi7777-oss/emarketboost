# EMarketBoost - Three-Panel SaaS Marketing Platform

Production-grade marketing automation platform with role-based access control, real-time synchronization, and comprehensive campaign management.

## 🎯 Features

### Three-Panel Architecture
- **User Panel**: Campaign creation wizard, real-time tracking, analytics
- **Service Team Panel**: Campaign management, draft uploads, client communication
- **Admin Panel**: Platform oversight, user management, analytics, revenue tracking

### Core Functionality
- ✅ Google OAuth 2.0 Authentication
- ✅ Role-based access control (User, Service, Admin)
- ✅ Real-time updates via Supabase Realtime
- ✅ Campaign creation wizard with cost calculator
- ✅ Multi-platform ad budget management (Google, Facebook, Instagram, YouTube)
- ✅ Actor database with dynamic pricing
- ✅ AI-generated and custom ad options
- ✅ Location targeting (worldwide or specific areas)
- ✅ Payment processing via Stripe
- ✅ Real-time notifications system
- ✅ Activity logging and audit trails
- ✅ Video upload and storage
- ✅ Campaign status tracking workflow
- ✅ Admin user management and role assignment

## 🚀 Setup Instructions

### 1. Database Setup

Run the SQL migration to create all tables and RLS policies:

```bash
# Navigate to Supabase dashboard > SQL Editor
# Copy and run: supabase/migrations/001_initial_schema.sql
```

This creates:
- 12 tables with full relationships
- Row Level Security policies for all roles
- Realtime subscriptions for instant updates
- Indexes for optimal performance
- Triggers for automatic timestamps

### 2. Supabase Realtime

Enable realtime for these tables in Supabase dashboard:
- campaign_requests
- notifications
- messages
- campaign_tasks

**Steps:**
1. Go to Database > Replication
2. Enable replication for each table
3. Ensure RLS is enabled

### 3. Storage Buckets

Create storage buckets in Supabase:
```sql
-- Run in SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-videos', 'campaign-videos', true);
```

Set up storage policies for uploads.

### 4. Environment Variables

Create `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=https://itmgxziovfyuyswmfxpd.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=itmgxziovfyuyswmfxpd

# Stripe (get from Stripe dashboard)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Google OAuth (already configured)
VITE_GOOGLE_CLIENT_ID=346438657358-k079viclt674h9hqhg880quspl3s4hk0.apps.googleusercontent.com
```

### 5. Seed Database

Create admin user and sample data:

```bash
# Update scripts/seed.ts with your Supabase Service Role Key
# Then run:
npm install --save-dev tsx
npx tsx scripts/seed.ts
```

**Admin Credentials (DEV ONLY):**
- Email: admin7@gmail.com
- Password: 2762003

⚠️ **Change these in production!**

### 6. Install Dependencies

```bash
npm install @stripe/stripe-js
npm install
```

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:8081`

## 📋 User Roles

### User (Client)
- Create campaigns via wizard
- Track campaign progress
- View analytics
- Receive notifications
- Download final videos

### Service Team
- View assigned campaigns
- Claim available campaigns
- Upload draft videos
- Update campaign status
- Communicate with clients
- Add internal notes

### Admin
- View all campaigns and users
- Assign campaigns to service team
- Change user roles
- Export data to CSV
- Platform analytics
- Override any settings

## 🔄 Campaign Workflow

1. **User creates campaign** → Status: `pending`
2. **User pays** → Status: `paid` (visible to service team)
3. **Service team claims** → Assigned
4. **Service uploads draft** → Status: `in_review`
5. **User approves** → Status: `in_progress`
6. **Service delivers final** → Status: `delivered`
7. **Campaign complete** → Status: `completed`

## 🔐 Security Features

- Row Level Security on all tables
- Role-based access control
- Secure payment processing
- Activity logging
- Email verification
- OAuth 2.0 authentication

## 🎨 Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)
- **Payments**: Stripe
- **Realtime**: Supabase Realtime
- **Storage**: Supabase Storage
- **State**: TanStack React Query

## 📦 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/
│   ├── user/        # User panel pages
│   ├── service/     # Service team pages
│   └── admin/       # Admin panel pages
├── lib/
│   ├── auth.ts      # Authentication utilities
│   ├── realtime.ts  # Realtime subscriptions
│   ├── costCalculator.ts  # Pricing engine
│   └── stripe.ts    # Payment processing
├── types/
│   └── database.ts  # TypeScript types
└── integrations/
    └── supabase/    # Supabase client

supabase/
└── migrations/      # SQL migrations

scripts/
└── seed.ts          # Database seeding
```

## 🧪 Testing

### Test Users
1. Create user via Google OAuth
2. Use seed script for admin
3. Manually create service team member via admin panel

### Test Campaign Flow
1. Login as user → Create campaign
2. Login as service → Claim campaign → Upload draft
3. Login as user → Review draft
4. Login as admin → View all data

## 🚀 Deployment

### Vite Build
```bash
npm run build
```

### Environment Variables (Production)
Update all `.env` variables with production credentials:
- Use production Stripe keys
- Set up production Supabase project
- Configure proper OAuth redirect URLs
- **Change admin password**

### Supabase Production
1. Create production project
2. Run migrations
3. Enable realtime
4. Configure storage policies
5. Set up database backups

## 📊 Real-time Features

All panels update instantly when:
- Campaign status changes
- New messages arrive
- Payments complete
- Assignments change
- Notifications created

## 🎯 Cost Calculation

Platform pricing model:
- **Production Cost**: Actor rate × duration or AI generation fee
- **Platform Cost**: Ad budget + 10% markup
- **Service Fee**: 15% of platform costs
- **Subscription Discount**: Applied based on plan

## 📝 Notes

- All sensitive credentials in `scripts/seed.ts` are for **DEVELOPMENT ONLY**
- Never commit `.env` file
- Row Level Security ensures data isolation
- Real-time subscriptions require proper RLS policies
- Stripe webhooks needed for production payments

## 🐛 Troubleshooting

**Google OAuth not working:**
- Check redirect URIs in Google Cloud Console
- Verify client ID in `.env`

**Realtime not updating:**
- Enable replication in Supabase
- Check RLS policies allow SELECT

**Payment failing:**
- Verify Stripe publishable key
- Check backend API routes exist

## 📞 Support

For issues or questions:
1. Check Supabase logs
2. Verify RLS policies
3. Test with admin account
4. Review activity logs table

---

**Built with ❤️ using Vite + React + Supabase**
