import { NextRequest, NextResponse } from 'next/server';
import { 
  getTemplateById, 
  updateTemplate, 
  deleteTemplate,
  templateExists 
} from '@/lib/db/templates';
import { LicenseType } from '@/lib/types/license';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/templates/:id - Get a specific template
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const template = await getTemplateById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/:id - Update a template
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { userId, name, licenseType, mintingFee, commercialRevShare, customTerms } = body;

    // Get existing template
    const existing = await getTemplateById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (userId && existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this template' },
        { status: 403 }
      );
    }

    // Validate license type if provided
    if (licenseType && !Object.values(LicenseType).includes(licenseType)) {
      return NextResponse.json(
        { error: 'Invalid license type' },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (name !== undefined) {
      if (name.trim().length === 0 || name.length > 50) {
        return NextResponse.json(
          { error: 'Template name must be 1-50 characters' },
          { status: 400 }
        );
      }

      // Check for duplicate name (if name is changing)
      if (name !== existing.name) {
        const exists = await templateExists(existing.userId, name);
        if (exists) {
          return NextResponse.json(
            { error: 'A template with this name already exists', code: 'DUPLICATE_NAME' },
            { status: 409 }
          );
        }
      }
    }

    // Validate commercialRevShare if provided
    if (commercialRevShare !== undefined && commercialRevShare !== null) {
      if (commercialRevShare < 0 || commercialRevShare > 100) {
        return NextResponse.json(
          { error: 'Revenue share must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Update template
    const template = await updateTemplate(id, {
      name: name?.trim(),
      licenseType,
      mintingFee,
      commercialRevShare,
      customTerms,
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/:id - Delete a template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get existing template
    const existing = await getTemplateById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (userId && existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this template' },
        { status: 403 }
      );
    }

    // Delete template
    const deleted = await deleteTemplate(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
