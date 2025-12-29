#!/usr/bin/env node

/**
 * Service Panel Setup Instructions
 */

console.log('\n👔 Service Panel Setup Instructions\n');
console.log('=' .repeat(70));

console.log('\n📋 Main Service Account Credentials:');
console.log('   Email:    service@gmail.com');
console.log('   Password: 7654321\n');

console.log('🚀 Quick Setup Steps:\n');

console.log('1. Create Service Account in Supabase Dashboard');
console.log('   → Go to https://app.supabase.com');
console.log('   → Authentication → Users → "Add user"');
console.log('   → Email: service@gmail.com');
console.log('   → Password: 7654321');
console.log('   → ✅ Check "Auto Confirm User"');
console.log('   → Click "Create user"\n');

console.log('2. Grant Service Role (SQL Editor):');
console.log('   \x1b[36m%s\x1b[0m', '   UPDATE public.profiles');
console.log('   \x1b[36m%s\x1b[0m', '   SET role = \'service\', full_name = \'Service Team Manager\'');
console.log('   \x1b[36m%s\x1b[0m', '   WHERE email = \'service@gmail.com\';\n');

console.log('3. Apply Employee Table Migration');
console.log('   → File: supabase/migrations/012_service_employees_table.sql');
console.log('   → Run manually in SQL Editor OR use Supabase CLI\n');

console.log('=' .repeat(70));

console.log('\n✨ Employee Registration:\n');
console.log('   → URL: http://localhost:5173/service/login');
console.log('   → Click "New Employee" tab');
console.log('   → Fill in: Name, Email, Phone, Address, PAN, Aadhar');
console.log('   → Employee ID auto-generates (e.g., EMP00001)');
console.log('   → Save Employee ID for login!\n');

console.log('=' .repeat(70));

console.log('\n📊 Service Panel Features:\n');
console.log('   ✅ Campaign Management - View & update assigned campaigns');
console.log('   ✅ Status Updates - Track progress (Review → Completed)');
console.log('   ✅ Client Communication - Add progress notes');
console.log('   ✅ Employee Profile - Complete KYC information');
console.log('   ✅ Performance Tracking - Stats, earnings, success rate');
console.log('   ✅ Commission System - 10% on completed campaigns\n');

console.log('=' .repeat(70));

console.log('\n🔑 Login Options:\n');
console.log('   Service Manager:');
console.log('   - Employee ID: service@gmail.com (or "service")');
console.log('   - Password: 7654321\n');
console.log('   Employee:');
console.log('   - Employee ID: EMP00001 (your generated ID)');
console.log('   - Password: [your password]\n');

console.log('=' .repeat(70));

console.log('\n🌐 Access URLs:\n');
console.log('   Service Login:    http://localhost:5173/service/login');
console.log('   Service Dashboard: http://localhost:5173/service');
console.log('   User Panel:       http://localhost:5173/auth');
console.log('   Admin Panel:      http://localhost:5173/admin/login\n');

console.log('📖 Full documentation: SERVICE_PANEL_SETUP.md\n');
console.log('=' .repeat(70) + '\n');
