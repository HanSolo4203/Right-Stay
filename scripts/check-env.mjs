#!/usr/bin/env node

/**
 * Environment Variable Diagnostic Script
 * Checks if Supabase environment variables are properly configured
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Supabase Environment Variable Check\n');
console.log('=' .repeat(50));

// Check if variables are set
console.log('\n📋 Variable Status:');
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ SET' : '❌ MISSING'}`);
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ SET' : '❌ MISSING'}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ SET' : '❌ MISSING'}`);

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log('\n❌ Missing environment variables!');
  console.log('\nPlease create a .env.local file with:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

// Validate URL format
console.log('\n🔗 URL Validation:');
if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  console.log(`  ✅ Valid Supabase URL format`);
  console.log(`  📌 Project Ref: ${projectRef || 'unknown'}`);
} else {
  console.log(`  ❌ Invalid URL format: ${supabaseUrl}`);
  console.log(`  Expected format: https://[project-ref].supabase.co`);
}

// Validate key formats
console.log('\n🔑 Key Validation:');
const anonKeyPattern = /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\./;
const serviceKeyPattern = /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\./;

if (anonKeyPattern.test(supabaseAnonKey)) {
  console.log(`  ✅ Anon key format looks valid (JWT)`);
} else {
  console.log(`  ⚠️  Anon key format may be invalid`);
}

if (serviceKeyPattern.test(supabaseServiceKey)) {
  console.log(`  ✅ Service role key format looks valid (JWT)`);
} else {
  console.log(`  ⚠️  Service role key format may be invalid`);
}

// Test connection
console.log('\n🧪 Testing Connection:');
try {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Try a simple query
  const { data, error } = await supabase.from('cached_properties').select('count').limit(1);
  
  if (error) {
    console.log(`  ❌ Connection failed: ${error.message}`);
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 Solution:');
      console.log('  1. Go to your Supabase dashboard: https://supabase.com/dashboard');
      console.log('  2. Select your project');
      console.log('  3. Go to Settings > API');
      console.log('  4. Copy the correct keys and update .env.local');
      console.log('  5. Restart your dev server (npm run dev)');
    }
  } else {
    console.log(`  ✅ Connection successful!`);
  }
} catch (err) {
  console.log(`  ❌ Error testing connection: ${err.message}`);
}

console.log('\n' + '='.repeat(50) + '\n');

