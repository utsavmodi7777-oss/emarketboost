import { supabase } from '../src/integrations/supabase/client';

/**
 * Admin Setup Script
 * This script helps create the admin user via Supabase Auth API
 */

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '2762003';

async function setupAdminUser() {
  console.log('🔧 Setting up admin user...\n');

  try {
    // Step 1: Try to sign up the admin user
    console.log('Step 1: Creating admin user account...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        data: {
          role: 'admin',
          full_name: 'System Administrator',
        },
      },
    });

    if (signUpError) {
      // If user already exists, that's okay
      if (signUpError.message.includes('already registered')) {
        console.log('✓ Admin user already exists');
        
        // Try to sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });

        if (signInError) {
          console.error('❌ Cannot sign in with admin credentials:', signInError.message);
          console.log('\n📝 Please update the password in Supabase Dashboard or this script');
          return;
        }

        console.log('✓ Successfully signed in as admin');
        const userId = signInData.user?.id;

        // Update profile to ensure admin role
        if (userId) {
          await updateProfileToAdmin(userId);
        }
      } else {
        throw signUpError;
      }
    } else {
      console.log('✓ Admin user created successfully');
      const userId = signUpData.user?.id;

      if (userId) {
        await updateProfileToAdmin(userId);
      }
    }

    console.log('\n✅ Admin setup complete!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n🌐 Access admin panel at: http://localhost:5173/admin/login');

  } catch (error: any) {
    console.error('\n❌ Error setting up admin user:', error.message);
    console.log('\n💡 Alternative: Create admin user manually via Supabase Dashboard');
    console.log('   1. Go to Authentication > Users');
    console.log('   2. Click "Add user" > "Create new user"');
    console.log('   3. Email:', ADMIN_EMAIL);
    console.log('   4. Password:', ADMIN_PASSWORD);
    console.log('   5. Check "Auto Confirm User"');
    console.log('   6. Create user');
    console.log('   7. Then run this SQL query:');
    console.log('\n   UPDATE public.profiles');
    console.log('   SET role = \'admin\', full_name = \'System Administrator\'');
    console.log('   WHERE email = \'' + ADMIN_EMAIL + '\';');
  }
}

async function updateProfileToAdmin(userId: string) {
  console.log('\nStep 2: Updating profile to admin role...');
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: 'admin',
      full_name: 'System Administrator',
    })
    .eq('id', userId);

  if (updateError) {
    console.error('❌ Error updating profile:', updateError.message);
    return;
  }

  console.log('✓ Profile updated to admin role');

  // Verify the update
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('❌ Error verifying profile:', fetchError.message);
    return;
  }

  if (profile?.role === 'admin') {
    console.log('✓ Verified: User has admin role');
  } else {
    console.warn('⚠️  Warning: Profile role is', profile?.role, 'instead of admin');
  }
}

// Run the setup
setupAdminUser().then(() => {
  console.log('\n👋 Setup script complete');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
