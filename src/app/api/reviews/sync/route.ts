import { NextResponse } from 'next/server';
import { ReviewSyncService } from '@/app/services/reviewSync';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const listingId = body.listingId;

    if (listingId) {
      // Sync single listing
      const success = await ReviewSyncService.syncListing(listingId);
      return NextResponse.json({ 
        success,
        message: success ? 'Listing synced successfully' : 'Failed to sync listing'
      });
    } else {
      // Sync all listings
      const success = await ReviewSyncService.syncAllListings();
      return NextResponse.json({ 
        success,
        message: success ? 'All listings synced successfully' : 'Failed to sync listings'
      });
    }
  } catch (error) {
    console.error('Error syncing reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to process sync request'
      },
      { status: 500 }
    );
  }
} 