import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('rezzai');
    const profiles = db.collection('profiles');

    const profile = await profiles.findOne({ userId });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (e) {
    console.error('Error fetching profile:', e);
    return NextResponse.json({ error: 'Failed to fetch profile', details: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, profileData } = await request.json();

    if (!userId || !profileData) {
      return NextResponse.json({ error: 'User ID and profile data are required' }, { status: 400 });
    }

    console.log('Attempting to save profile for user:', userId);
    
    const client = await clientPromise;
    const db = client.db('rezzai');
    const profiles = db.collection('profiles');

    const result = await profiles.updateOne(
      { userId },
      { $set: { ...profileData, userId, updatedAt: new Date() } },
      { upsert: true } // Create if not exists
    );

    console.log('Profile saved successfully:', result);
    return NextResponse.json({ message: 'Profile saved successfully', result });
  } catch (e) {
    console.error('Error saving profile:', e);
    
    // Provide more specific error messages
    if (e.name === 'MongoNetworkError') {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: 'Unable to connect to the database. Please try again.',
        type: 'network_error'
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to save profile', 
      details: e.message,
      type: 'database_error'
    }, { status: 500 });
  }
}


