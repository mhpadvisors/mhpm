import { createClient } from '@vercel/postgres';

export class ReviewSyncService {
  static async syncListing(listingId: number): Promise<boolean> {
    const client = createClient();
    
    try {
      await client.connect();
      
      // First get the listing details
      const { rows } = await client.query(
        'SELECT name, city, state FROM mhp_listings WHERE id = $1',
        [listingId]
      );
      
      if (rows.length === 0) {
        console.error('Listing not found:', listingId);
        return false;
      }

      const listing = rows[0];
      
      // Update the database with a placeholder for now
      await client.query(
        `UPDATE mhp_listings 
         SET last_review_sync = NOW()
         WHERE id = $1`,
        [listingId]
      );

      return true;
    } catch (error) {
      console.error('Error in syncListing:', error);
      return false;
    } finally {
      await client.end();
    }
  }

  static async syncAllListings(): Promise<boolean> {
    const client = createClient();
    
    try {
      await client.connect();
      const { rows } = await client.query('SELECT id FROM mhp_listings');
      
      for (const row of rows) {
        await this.syncListing(row.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error in syncAllListings:', error);
      return false;
    } finally {
      await client.end();
    }
  }
} 