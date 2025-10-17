import { NextResponse } from 'next/server';

/**
 * Test different header formats for Uplisting API
 */
export async function GET() {
  try {
    const apiKey = process.env.UPLISTING_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not set' }, { status: 400 });
    }

    const results = [];

    // Test 1: Bearer token (standard OAuth)
    console.log('Test 1: Authorization: Bearer TOKEN');
    try {
      const res1 = await fetch('https://api.uplisting.io/v2/properties?page[limit]=1', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      results.push({
        method: 'Authorization: Bearer TOKEN',
        status: res1.status,
        ok: res1.ok,
        error: !res1.ok ? await res1.text() : null,
      });
    } catch (e) {
      results.push({ method: 'Authorization: Bearer TOKEN', error: String(e) });
    }

    // Test 2: API key in header (common for some APIs)
    console.log('Test 2: X-API-Key: TOKEN');
    try {
      const res2 = await fetch('https://api.uplisting.io/v2/properties?page[limit]=1', {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });
      results.push({
        method: 'X-API-Key: TOKEN',
        status: res2.status,
        ok: res2.ok,
        error: !res2.ok ? await res2.text() : null,
      });
    } catch (e) {
      results.push({ method: 'X-API-Key: TOKEN', error: String(e) });
    }

    // Test 3: Uplisting-API-Key header
    console.log('Test 3: Uplisting-API-Key: TOKEN');
    try {
      const res3 = await fetch('https://api.uplisting.io/v2/properties?page[limit]=1', {
        headers: {
          'Uplisting-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });
      results.push({
        method: 'Uplisting-API-Key: TOKEN',
        status: res3.status,
        ok: res3.ok,
        error: !res3.ok ? await res3.text() : null,
      });
    } catch (e) {
      results.push({ method: 'Uplisting-API-Key: TOKEN', error: String(e) });
    }

    // Test 4: Token in query string
    console.log('Test 4: Query string ?api_key=TOKEN');
    try {
      const res4 = await fetch(`https://api.uplisting.io/v2/properties?page[limit]=1&api_key=${apiKey}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      results.push({
        method: 'Query string ?api_key=TOKEN',
        status: res4.status,
        ok: res4.ok,
        error: !res4.ok ? await res4.text() : null,
      });
    } catch (e) {
      results.push({ method: 'Query string ?api_key=TOKEN', error: String(e) });
    }

    // Test 5: Authorization without Bearer
    console.log('Test 5: Authorization: TOKEN (no Bearer)');
    try {
      const res5 = await fetch('https://api.uplisting.io/v2/properties?page[limit]=1', {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      });
      results.push({
        method: 'Authorization: TOKEN (no Bearer)',
        status: res5.status,
        ok: res5.ok,
        error: !res5.ok ? await res5.text() : null,
      });
    } catch (e) {
      results.push({ method: 'Authorization: TOKEN (no Bearer)', error: String(e) });
    }

    return NextResponse.json({
      message: 'Tested different authentication methods',
      api_key_prefix: apiKey.substring(0, 8) + '...',
      results,
      winner: results.find(r => r.ok) || null,
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

