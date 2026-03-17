import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectToDatabase } from '@/lib/db';
import { Application } from '@/models/Application';
import { APPLICATION_STATUSES, EMPLOYMENT_TYPES, WORK_MODES } from '@/lib/constants';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch {
    return null;
  }
}

// GET /api/applications — fetch logged-in user's applications
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const applications = await Application.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST /api/applications — create a new application
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { company, position, location, status, dateApplied, employmentType, workMode, notes } = body;

    // Server-side validation
    const errors: Record<string, string> = {};

    if (!company || typeof company !== 'string' || company.trim().length < 2) {
      errors.company = 'Company is required and must be at least 2 characters';
    } else if (company.trim().length > 100) {
      errors.company = 'Company must be at most 100 characters';
    }

    if (!position || typeof position !== 'string' || position.trim().length < 2) {
      errors.position = 'Position is required and must be at least 2 characters';
    } else if (position.trim().length > 100) {
      errors.position = 'Position must be at most 100 characters';
    }

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      errors.location = 'Location is required';
    } else if (location.trim().length > 100) {
      errors.location = 'Location must be at most 100 characters';
    }

    if (!status || !APPLICATION_STATUSES.includes(status)) {
      errors.status = 'Invalid status value';
    }

    if (!dateApplied || isNaN(new Date(dateApplied).getTime())) {
      errors.dateApplied = 'A valid date applied is required';
    }

    if (!employmentType || !EMPLOYMENT_TYPES.includes(employmentType)) {
      errors.employmentType = 'Invalid employment type';
    }

    if (!workMode || !WORK_MODES.includes(workMode)) {
      errors.workMode = 'Invalid work mode';
    }

    if (notes && notes.length > 500) {
      errors.notes = 'Notes must be at most 500 characters';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    await connectToDatabase();

    const application = await Application.create({
      userId,
      company: company.trim(),
      position: position.trim(),
      location: location.trim(),
      status,
      dateApplied: new Date(dateApplied),
      employmentType,
      workMode,
      notes: notes?.trim() ?? '',
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
  }
}
