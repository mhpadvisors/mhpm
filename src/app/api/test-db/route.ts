import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = createClient();
  
  try {
    await client.connect();
    const { rows } = await client.query('SELECT NOW()');
    return NextResponse.json({ success: true, timestamp: rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ success: false, error: 'Failed to connect to database' });
  } finally {
    await client.end();
  }
}