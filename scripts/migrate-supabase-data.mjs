#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const requiredEnv = [
  'SUPABASE_SOURCE_URL',
  'SUPABASE_SOURCE_SERVICE_ROLE_KEY',
  'SUPABASE_TARGET_URL',
  'SUPABASE_TARGET_SERVICE_ROLE_KEY',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const source = createClient(
  process.env.SUPABASE_SOURCE_URL!,
  process.env.SUPABASE_SOURCE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const target = createClient(
  process.env.SUPABASE_TARGET_URL!,
  process.env.SUPABASE_TARGET_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const propertyIds = (process.env.SUPABASE_PROPERTY_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

async function copyTable(tableName, builderCallback, options = {}) {
  const builder = builderCallback(source.from(tableName));
  const { data, error } = await builder;

  if (error) {
    throw new Error(`Failed to read ${tableName}: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.log(`No rows to migrate for ${tableName}.`);
    return;
  }

  const { error: upsertError } = await target
    .from(tableName)
    .upsert(data, { ...options, onConflict: options.onConflict || 'id' });

  if (upsertError) {
    throw new Error(`Failed to upsert ${tableName}: ${upsertError.message}`);
  }

  console.log(`Migrated ${data.length} rows from ${tableName}.`);
}

async function run() {
  console.log('Starting Supabase data transfer (cached_properties + property_photos)');
  console.log('Property filter:', propertyIds.length > 0 ? propertyIds : 'all cached_properties');

  await copyTable('cached_properties', (table) => {
    const base = table.select('*').order('created_at', { ascending: true });
    return propertyIds.length > 0 ? base.in('uplisting_id', propertyIds) : base;
  });

  console.log(
    propertyIds.length > 0
      ? `Syncing photos for ${propertyIds.length} filtered property${propertyIds.length > 1 ? 'ies' : ''}.`
      : 'Syncing photos for every property in cached_properties.'
  );

  await copyTable('property_photos', (table) => {
    const base = table.select('*').order('position', { ascending: true });
    return propertyIds.length > 0 ? base.in('property_id', propertyIds) : base;
  });
}

run()
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Migration finished.');
  });

