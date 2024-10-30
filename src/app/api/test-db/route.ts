import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    console.log('Creating database client...');
    
    const client = createClient({
      connectionString: process.env.POSTGRES_URL,
      ssl: true
    });
    
    console.log('Connecting to database...');
    await client.connect();
    
    const result = await client.query('SELECT NOW();');
    
    await client.end();
    
    console.log('Query result:', result.rows[0]);
    
    return NextResponse.json({ 
      success: true, 
      timestamp: result.rows[0].now,
      message: 'Database connection successful'
    });
    
  } catch (error: any) {
    console.error('Full error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      type: error.constructor.name
    }, { 
      status: 500 
    });
  }
};