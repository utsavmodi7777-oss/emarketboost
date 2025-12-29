/**
 * Database Seed Script
 * Creates development admin account and sample data
 * 
 * IMPORTANT: This file contains sensitive credentials for DEVELOPMENT ONLY
 * NEVER commit real credentials or use in production
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Replace with service role key from Supabase dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// DEV ADMIN CREDENTIALS (as specified)
const DEV_ADMIN = {
  email: 'admin7@gmail.com',
  password: '2762003',
  full_name: 'Admin User',
  role: 'admin',
};

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Create admin user
    console.log('Creating admin user...');
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: DEV_ADMIN.email,
      password: DEV_ADMIN.password,
      email_confirm: true,
      user_metadata: {
        full_name: DEV_ADMIN.full_name,
      },
    });

    if (adminError) {
      if (adminError.message.includes('already registered')) {
        console.log('⚠️  Admin user already exists, skipping...');
      } else {
        throw adminError;
      }
    } else {
      console.log('✅ Admin user created:', adminUser.user?.email);

      // Update profile role to admin
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', adminUser.user!.id);
      
      console.log('✅ Admin role assigned');
    }

    // 2. Create sample plans
    console.log('Creating subscription plans...');
    const plans = [
      {
        name: 'Starter',
        price: 29.00,
        billing_period: 'monthly',
        discount_percentage: 0,
        features: [
          '1 Campaign per month',
          'Basic analytics',
          'Email support',
          'Google & Facebook Ads',
        ],
        is_active: true,
      },
      {
        name: 'Professional',
        price: 99.00,
        billing_period: 'monthly',
        discount_percentage: 10,
        features: [
          '5 Campaigns per month',
          'Advanced analytics',
          'Priority support',
          'All platforms',
          'AI-generated ads',
          'Custom targeting',
        ],
        is_active: true,
      },
      {
        name: 'Enterprise',
        price: 299.00,
        billing_period: 'monthly',
        discount_percentage: 20,
        features: [
          'Unlimited campaigns',
          'Real-time analytics',
          '24/7 dedicated support',
          'All platforms',
          'Actor ads included',
          'Custom integrations',
          'API access',
        ],
        is_active: true,
      },
    ];

    for (const plan of plans) {
      const { error } = await supabase.from('plans').insert(plan);
      if (error && !error.message.includes('duplicate')) {
        console.error('Error creating plan:', plan.name, error);
      } else {
        console.log(`✅ Plan created: ${plan.name}`);
      }
    }

    // 3. Create sample actors
    console.log('Creating sample actors...');
    const actors = [
      {
        name: 'John Smith',
        category: 'Professional Actor',
        bio: 'Experienced actor with 10+ years in commercial advertising',
        rate_per_day: 500,
        availability: true,
        rating: 4.8,
        total_projects: 45,
      },
      {
        name: 'Sarah Johnson',
        category: 'Model',
        bio: 'Fashion model and brand ambassador',
        rate_per_day: 750,
        availability: true,
        rating: 4.9,
        total_projects: 62,
      },
      {
        name: 'Mike Davis',
        category: 'Voice Actor',
        bio: 'Professional voice talent for commercials and narration',
        rate_per_day: 300,
        availability: true,
        rating: 4.7,
        total_projects: 120,
      },
    ];

    for (const actor of actors) {
      const { error } = await supabase.from('actors').insert(actor);
      if (error && !error.message.includes('duplicate')) {
        console.error('Error creating actor:', actor.name, error);
      } else {
        console.log(`✅ Actor created: ${actor.name}`);
      }
    }

    console.log('\n🎉 Database seeding complete!');
    console.log('\n📧 Admin Login:');
    console.log(`   Email: ${DEV_ADMIN.email}`);
    console.log(`   Password: ${DEV_ADMIN.password}`);
    console.log('\n⚠️  Remember to change these credentials in production!\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
