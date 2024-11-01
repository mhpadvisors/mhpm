import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const client = createClient({
      connectionString: process.env.POSTGRES_URL,
      ssl: true
    });
    
    await client.connect();
    
    // Drop view first, then table
    await client.query(`
      DROP VIEW IF EXISTS mhp_listings_with_metrics;
      DROP TABLE IF EXISTS mhp_listings;
      
      CREATE TABLE mhp_listings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NULL,
        longitude DECIMAL(11, 8) NULL,
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(2),
        zip VARCHAR(10),
        total_units INTEGER,
        asking_price DECIMAL(12, 2),
        net_operating_income DECIMAL(12, 2),
        cap_rate DECIMAL(5, 2),
        opportunity_zone BOOLEAN DEFAULT false,
        property_description TEXT,
        listing_status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE OR REPLACE VIEW mhp_listings_with_metrics AS
      SELECT 
        *,
        CASE 
          WHEN total_units > 0 AND asking_price IS NOT NULL 
          THEN asking_price / total_units 
          ELSE NULL 
        END as price_per_unit
      FROM mhp_listings;
    `);

    await client.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Database schema updated successfully'
    });

  } catch (error: any) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { 
      status: 500 
    });
  }
}; 