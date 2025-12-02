import { NextRequest, NextResponse } from 'next/server';
import { 
  createTemplate, 
  getTemplatesByUser, 
  templateExists 
} from '@/lib/db/templates';
import { LicenseType } from '@/lib/types/license';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/templates - Create a new license template
 */
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!userId || !name || !licenseType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, licenseType' },
        { status: 400 }
      );
    }

    // Validate license type
    if (!Object.values(LicenseType).includes(licenseType)) {
      return NextResponse.json(
        { error: 'Invalid license type' },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length === 0 || name.length > 50) {
      return NextResponse.json(
        { error: 'Template name must be 1-50 characters' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const exists = await templateExists(userId, name);
    if (exists) {
      return NextResponse.json(
        { error: 'A template with this name already exists', code: 'DUPLICATE_NAME' },
        { status: 409 }
      );
    }

    // Validate commercialRevShare if provided
    if (commercialRevShare !== undefined && (commercialRevShare < 0 || commercialRevShare > 100)) {
      return NextResponse.json(
        { error: 'Revenue share must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Create template
    const template = await createTemplate({
      userId,
      name: name.trim(),
      licenseType,
      mintingFee,
      commercialRevShare,
      customTerms,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/templates - List user's templates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const templates = await getTemplatesByUser(userId);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
