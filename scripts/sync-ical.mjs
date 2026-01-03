#!/usr/bin/env node

/**
 * Sync iCal feed for a property
 * Usage: node scripts/sync-ical.mjs <propertyId>
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ICAL from 'node-ical';

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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function parseIcalFeed(icalUrl) {
  try {
    console.log('📥 Fetching iCal feed from:', icalUrl);
    const events = await ICAL.async.fromURL(icalUrl);
    const blockedDates = [];

    for (const event of Object.values(events)) {
      if (event.type === 'VEVENT') {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const summary = event.summary || 'Booked';
        
        console.log(`  📅 Event: ${summary} from ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`);
        
        const currentDate = new Date(start);
        currentDate.setHours(0, 0, 0, 0);
        
        while (currentDate < end) {
          blockedDates.push({
            date: currentDate.toISOString().split('T')[0],
            reason: summary,
            source: 'airbnb'
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    console.log(`✅ Parsed ${blockedDates.length} blocked dates`);
    return blockedDates;
  } catch (error) {
    console.error('❌ Error parsing iCal feed:', error.message);
    throw error;
  }
}

async function syncProperty(propertyId) {
  try {
    console.log(`\n🔄 Syncing availability for property: ${propertyId}\n`);

    // Fetch property
    const { data: property, error: propertyError } = await supabase
      .from('cached_properties')
      .select('uplisting_id, ical_url, data')
      .eq('uplisting_id', propertyId)
      .single();

    if (propertyError || !property) {
      console.error('❌ Property not found:', propertyError?.message);
      return;
    }

    if (!property.ical_url) {
      console.error('❌ No iCal URL configured for this property');
      return;
    }

    console.log(`📍 Property: ${property.data?.attributes?.name || propertyId}`);
    console.log(`🔗 iCal URL: ${property.ical_url}\n`);

    // Parse iCal feed
    const blockedDates = await parseIcalFeed(property.ical_url);

    if (blockedDates.length === 0) {
      console.log('ℹ️  No blocked dates found in iCal feed');
      return;
    }

    // Clear existing availability
    console.log('\n🗑️  Clearing existing availability data...');
    const { error: deleteError } = await supabase
      .from('cached_availability')
      .delete()
      .eq('property_id', propertyId);

    if (deleteError) {
      console.error('⚠️  Error deleting old data:', deleteError.message);
    } else {
      console.log('✅ Cleared old availability data');
    }

    // Insert new availability data
    console.log('\n💾 Saving blocked dates to database...');
    const availabilityRecords = blockedDates.map(blocked => ({
      property_id: propertyId,
      date: blocked.date,
      available: false,
      blocked_reason: blocked.reason,
      last_synced: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('cached_availability')
      .insert(availabilityRecords);

    if (insertError) {
      console.error('❌ Error inserting data:', insertError.message);
      return;
    }

    console.log(`✅ Successfully synced ${blockedDates.length} blocked dates`);
    console.log(`\n📊 Sample dates:`);
    blockedDates.slice(0, 5).forEach(bd => {
      console.log(`   - ${bd.date}: ${bd.reason}`);
    });
    if (blockedDates.length > 5) {
      console.log(`   ... and ${blockedDates.length - 5} more`);
    }

  } catch (error) {
    console.error('❌ Error syncing property:', error.message);
  }
}

// Get property ID from command line
const propertyId = process.argv[2] || '135133';

syncProperty(propertyId)
  .then(() => {
    console.log('\n✨ Sync complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Sync failed:', err);
    process.exit(1);
  });






