#!/usr/bin/env node

/**
 * Test Supabase Connection
 * Loads .env.local and tests the connection
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

// Load .env.local manually
let envVars = {};
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value.trim();
      }
    }
  });
} catch (err) {
  console.error('❌ Could not read .env.local:', err.message);
  process.exit(1);
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Testing Supabase Connection\n');
console.log('='.repeat(60));

// Check variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log('\n❌ Missing environment variables!');
  console.log('Found:');
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌'}`);
  process.exit(1);
}

// Show URL (safe to show)
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
console.log(`\n📌 Project: ${projectRef || 'unknown'}`);
console.log(`🔗 URL: ${supabaseUrl}`);

// Test anon key
console.log('\n🧪 Testing Anon Key...');
try {
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabaseAnon
    .from('cached_properties')
    .select('count')
    .limit(1);
  
  if (error) {
    console.log(`  ❌ Anon key failed: ${error.message}`);
    if (error.message.includes('Invalid API key')) {
      console.log('  💡 The anon key is invalid for this project');
    }
  } else {
    console.log(`  ✅ Anon key works!`);
  }
} catch (err) {
  console.log(`  ❌ Error: ${err.message}`);
}

// Test service role key
console.log('\n🧪 Testing Service Role Key...');
try {
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabaseService
    .from('cached_properties')
    .select('count')
    .limit(1);
  
  if (error) {
    console.log(`  ❌ Service role key failed: ${error.message}`);
    if (error.message.includes('Invalid API key')) {
      console.log('  💡 The service role key is invalid for this project');
    }
  } else {
    console.log(`  ✅ Service role key works!`);
  }
} catch (err) {
  console.log(`  ❌ Error: ${err.message}`);
}

// Check if tables exist
console.log('\n📊 Checking Tables...');
try {
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  
  const tables = ['cached_properties', 'property_photos', 'tour_packages'];
  for (const table of tables) {
    const { error } = await supabaseService.from(table).select('count').limit(1);
    if (error) {
      console.log(`  ❌ Table "${table}": ${error.message}`);
    } else {
      console.log(`  ✅ Table "${table}" exists`);
    }
  }
} catch (err) {
  console.log(`  ❌ Error checking tables: ${err.message}`);
}

console.log('\n' + '='.repeat(60) + '\n');

