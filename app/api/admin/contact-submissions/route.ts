import { NextResponse } from 'next/server';
import { listContactSubmissions } from '@/lib/contact-submissions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const submissions = await listContactSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json([]);
  }
}
