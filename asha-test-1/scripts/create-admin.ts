import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYndydnZ2Y2xreXpwaXJzbG10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjM4NDkwMCwiZXhwIjoyMDU3OTYwOTAwfQ.Oi6VCVQhVVxKlXHWh6YKZiWjwVGc5QhBQAMRJv4UFXU';

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

// Create Supabase admin client with service role key
const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    // First check if user already exists
    const { data: existingUsers, error: listError } = await adminSupabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error checking existing users:', listError.message);
      return;
    }

    const userExists = existingUsers.users.some(user => user.email === 'stage.steff@gmail.com');

    if (userExists) {
      console.log('User stage.steff@gmail.com already exists. Skipping creation.');
      return;
    }

    // Create the admin user with email confirmation disabled
    const { data: { user }, error: createError } = await adminSupabase.auth.admin.createUser({
      email: 'stage.steff@gmail.com',
      password: 'asha123',
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    });

    if (createError) {
      console.error('Error creating admin user:', createError.message);
      return;
    }

    if (!user) {
      console.error('No user data returned');
      return;
    }

    console.log('Admin user created successfully:', {
      id: user.id,
      email: user.email
    });

    // Insert into public.users table
    const { error: insertError } = await adminSupabase
      .from('users')
      .insert([{ id: user.id, email: user.email }]);

    if (insertError) {
      console.error('Error inserting into users table:', insertError.message);
      return;
    }

    // Add admin role
    const { data: roleData, error: roleError } = await adminSupabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    if (roleError) {
      console.error('Error fetching admin role:', roleError.message);
      return;
    }

    const { error: roleAssignError } = await adminSupabase
      .from('roles_per_user')
      .insert([{
        user_id: user.id,
        role_id: roleData.id
      }]);

    if (roleAssignError) {
      console.error('Error assigning admin role:', roleAssignError.message);
      return;
    }

    console.log('User added to public.users table and assigned admin role');
    console.log('You can now log in with:');
    console.log('Email: stage.steff@gmail.com');
    console.log('Password: asha123');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();