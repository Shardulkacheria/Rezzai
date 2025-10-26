import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch user's applications
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('rezzai');
    const applications = db.collection('applications');
    
    // Fetch applications for the user, sorted by appliedAt (newest first)
    const userApplications = await applications
      .find({ userId })
      .sort({ appliedAt: -1 })
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      applications: userApplications 
    });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Create new application record
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      jobId, 
      company, 
      jobTitle, 
      resumeUsed, 
      status = 'Pending',
      jobUrl 
    } = body;
    
    if (!userId || !jobId || !company || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('rezzai');
    const applications = db.collection('applications');
    
    // Check if application already exists
    const existingApplication = await applications.findOne({
      userId,
      jobId
    });
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'Application already exists for this job' },
        { status: 409 }
      );
    }
    
    // Create new application record
    const application = {
      userId,
      jobId,
      company,
      jobTitle,
      resumeUsed: resumeUsed || 'Default Resume',
      status,
      jobUrl: jobUrl || '',
      appliedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await applications.insertOne(application);
    
    return NextResponse.json({
      success: true,
      application: {
        _id: result.insertedId,
        ...application
      }
    });
    
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

// PUT - Update application status
export async function PUT(request) {
  try {
    const body = await request.json();
    const { applicationId, status } = body;
    
    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }
    
    const validStatuses = ['Pending', 'Applied', 'Skipped', 'Rejected', 'Interview', 'Offer'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('rezzai');
    const applications = db.collection('applications');
    
    // Update application status
    const result = await applications.updateOne(
      { _id: new ObjectId(applicationId) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE - Remove application
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('rezzai');
    const applications = db.collection('applications');
    
    const result = await applications.deleteOne({
      _id: new ObjectId(applicationId)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
