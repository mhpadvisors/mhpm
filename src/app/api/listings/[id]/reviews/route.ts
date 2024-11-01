import { NextResponse } from 'next/server';
import { updateListingReviews } from '@/app/services/reviewAnalysis';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = parseInt(params.id);
    const { placeId } = await request.json();

    const analysis = await updateListingReviews(listingId, placeId);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('Error updating reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 
import { updateListingReviews } from '@/app/services/reviewAnalysis';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = parseInt(params.id);
    const { placeId } = await request.json();

    const analysis = await updateListingReviews(listingId, placeId);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('Error updating reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 