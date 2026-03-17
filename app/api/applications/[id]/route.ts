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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateBody(body: Record<string, any>) {
  const { company, position, location, status, dateApplied, employmentType, workMode, notes } = body;
  const errors: Record<string, string> = {};

  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    errors.company = 'Company is required and must be at least 2 characters';
  } else if ((company as string).trim().length > 100) {
    errors.company = 'Company must be at most 100 characters';
  }

  if (!position || typeof position !== 'string' || position.trim().length < 2) {
    errors.position = 'Position is required and must be at least 2 characters';
  } else if ((position as string).trim().length > 100) {
    errors.position = 'Position must be at most 100 characters';
  }

  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    errors.location = 'Location is required';
  } else if ((location as string).trim().length > 100) {
    errors.location = 'Location must be at most 100 characters';
  }

  if (!status || !APPLICATION_STATUSES.includes(status)) {
    errors.status = 'Invalid status value';
  }

  if (!dateApplied || isNaN(new Date(dateApplied as string).getTime())) {
    errors.dateApplied = 'A valid date applied is required';
  }

  if (!employmentType || !EMPLOYMENT_TYPES.includes(employmentType)) {
    errors.employmentType = 'Invalid employment type';
  }

  if (!workMode || !WORK_MODES.includes(workMode)) {
    errors.workMode = 'Invalid work mode';
  }

  if (notes && (notes as string).length > 500) {
    errors.notes = 'Notes must be at most 500 characters';
  }

  return errors;
}

// PUT /api/applications/[id] — update an application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const errors = validateBody(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    const { company, position, location, status, dateApplied, employmentType, workMode, notes } = body;

    await connectToDatabase();

    const application = await Application.findOneAndUpdate(
      { _id: id, userId },
      {
        company: (company as string).trim(),
        position: (position as string).trim(),
        location: (location as string).trim(),
        status,
        dateApplied: new Date(dateApplied as string),
        employmentType,
        workMode,
        notes: (notes as string)?.trim() ?? '',
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error: unknown) {
    console.error('PUT /api/applications/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

// DELETE /api/applications/[id] — delete an application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectToDatabase();

    const application = await Application.findOneAndDelete({ _id: id, userId });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE /api/applications/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
