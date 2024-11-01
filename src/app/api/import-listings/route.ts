import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';

export const GET = async () => {
  try {
    console.log('Starting import process...');
    
    // Read the CSV file and remove BOM
    let csvContent = await fs.readFile('data_for_uploads/listings.csv', 'utf-8');
    csvContent = csvContent.replace(/^\uFEFF/, '');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    let skippedRecords = 0;
    let importedRecords = 0;

    // Connect to database
    const client = createClient({
      connectionString: process.env.POSTGRES_URL,
      ssl: true
    });
    
    await client.connect();
    console.log('Connected to database');

    // Clear existing data
    await client.query('TRUNCATE TABLE mhp_listings RESTART IDENTITY;');

    // Insert each record
    for (const record of records) {
      // Skip records with invalid state codes
      if (!record.state || record.state === 'N/A' || record.state.length > 2) {
        console.log(`Skipping record: ${record.name} - Invalid state: ${record.state}`);
        skippedRecords++;
        continue;
      }

      try {
        await client.query(`
          INSERT INTO mhp_listings (
            name,
            address,
            city,
            state,
            zip,
            total_units,
            asking_price,
            net_operating_income,
            cap_rate,
            opportunity_zone,
            latitude,
            longitude
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          record.name,
          record.address,
          record.city,
          record.state,
          record.zip,
          parseInt(record.total_units) || null,
          parseFloat(record.asking_price?.replace(/[^0-9.]/g, '')) || null,
          parseFloat(record.net_operating_income?.replace(/[^0-9.]/g, '')) || null,
          parseFloat(record.cap_rate?.replace(/[^0-9.]/g, '')) || null,
          record.opportunity_zone?.toLowerCase() === 'yes',
          parseFloat(record.latitude) || null,
          parseFloat(record.longitude) || null
        ]);
        importedRecords++;
        
        if (importedRecords % 100 === 0) {
          console.log(`Imported ${importedRecords} records...`);
        }
      } catch (err) {
        console.error(`Error importing record: ${record.name}`, err);
        skippedRecords++;
      }
    }

    await client.end();
    console.log('Import completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: `Import completed. Imported: ${importedRecords}, Skipped: ${skippedRecords}`,
      totalRecords: records.length,
      importedRecords,
      skippedRecords
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.toString(),
      hint: 'Check column names in CSV match database columns'
    }, { 
      status: 500 
    });
  }
}; 