const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const anonMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
const serviceMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseServiceKey = serviceMatch[1].trim();
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log('Checking profiles table...');
  const { data: profiles, error: profError } = await supabaseAdmin.from('profiles').select('id').limit(1);
  if (profError) {
    console.error('Profiles table error:', profError.message);
  } else {
    console.log('Profiles table exists.');
  }
}

check();
