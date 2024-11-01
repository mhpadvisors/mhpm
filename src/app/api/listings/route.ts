import { NextResponse } from 'next/server';
import { createClient } from '@vercel/postgres';

export async function GET() {
  const client = createClient();
  
  try {
    await client.connect();
    console.log('Fetching listings from database...');
    
    const { rows } = await client.query(`
      SELECT 
        id, 
        name, 
        latitude, 
        longitude, 
        city, 
        state,
        total_units as units,
        net_operating_income as noi,
        cap_rate,
        asking_price,
        google_rating,
        google_total_reviews
      FROM mhp_listings 
      WHERE latitude IS NOT NULL 
      AND longitude IS NOT NULL
    `);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  } finally {
    await client.end();
  }
} 