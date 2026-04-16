const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  try {
    const { data: usersData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;
    console.log("Users in Auth:", usersData.users.map(u => u.email));
    
    const { data: dbUsers, error: dbError } = await supabaseAdmin.from('users').select('email, role');
    if (dbError) throw dbError;
    console.log("Users in DB:", dbUsers.map(u => u.email));

    // Try a login test programmatically
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: 'rektor@test.com',
      password: 'password123'
    });
    
    if (signInError) {
      console.log("Login Test Error:", signInError.message);
    } else {
      console.log("Login Test Success for:", signInData.user.email);
    }
    
  } catch (err) {
    console.error("Script Error:", err);
  }
}
run();
