import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify Uplisting API connectivity
 */
export async function GET() {
  try {
    const apiKey = process.env.UPLISTING_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'UPLISTING_API_KEY is not configured in .env.local',
        instructions: 'Add UPLISTING_API_KEY=your_key_here to .env.local file',
      }, { status: 400 });
    }

    if (apiKey === 'your_uplisting_api_key_here') {
      return NextResponse.json({
        status: 'error',
        message: 'UPLISTING_API_KEY is still set to placeholder value',
        instructions: 'Replace with your actual Uplisting API key from Settings > Connect > API Key',
      }, { status: 400 });
    }

    console.log('Testing Uplisting API connection...');
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');

    // Test with properties endpoint (correct base URL)
    const response = await fetch('https://connect.uplisting.io/properties', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    const statusCode = response.status;
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        message: `Uplisting API returned error: ${statusCode}`,
        api_response: responseData,
        instructions: statusCode === 401 
          ? 'API key is invalid. Please check your Uplisting API key.'
          : statusCode === 404
          ? 'API endpoint not found. This might indicate an API version issue.'
          : 'Unknown error. Check the api_response for details.',
      }, { status: 200 });
    }

    const propertyCount = responseData.data?.length || 0;

    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Uplisting API',
      properties_found: propertyCount,
      sample_property: responseData.data?.[0] || null,
      instructions: 'API key is working! You can now sync photos.',
    });

  } catch (error) {
    console.error('Error testing Uplisting API:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Uplisting API',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

