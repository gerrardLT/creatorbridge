import { NextRequest, NextResponse } from 'next/server';
import { upsertUser, findUserByWallet, findUserById } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/user - Get user by wallet or id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const userId = searchParams.get('id');

    if (!walletAddress && !userId) {
      return NextResponse.json(
        { error: 'Wallet address or user ID is required' },
        { status: 400 }
      );
    }

    const user = walletAddress
      ? await findUserByWallet(walletAddress)
      : await findUserById(userId!);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name || 'Unknown',
        walletAddress: user.walletAddress,
        avatarUrl: user.avatarUrl || ''
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// POST /api/user - Create or update user (login)
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

    const { walletAddress, name, avatarUrl } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const user = await upsertUser({
      walletAddress,
      name: name || `User_${walletAddress.substring(0, 6)}`,
      avatarUrl: avatarUrl || `https://picsum.photos/seed/${walletAddress}/100/100`
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name || 'Unknown',
        walletAddress: user.walletAddress,
        avatarUrl: user.avatarUrl || '',
        bio: (user as any).bio || ''
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Update user profile
export async function PATCH(request: NextRequest) {
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

    const { userId, name, bio } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate name
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name cannot be empty' },
          { status: 400 }
        );
      }
      if (name.length > 50) {
        return NextResponse.json(
          { error: 'Name must be 50 characters or less' },
          { status: 400 }
        );
      }
    }

    // Validate bio
    if (bio !== undefined && typeof bio === 'string' && bio.length > 200) {
      return NextResponse.json(
        { error: 'Bio must be 200 characters or less' },
        { status: 400 }
      );
    }

    // Import prisma directly for update
    const prisma = (await import('@/lib/prisma')).default;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() })
      }
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name || 'Unknown',
        walletAddress: updatedUser.walletAddress,
        avatarUrl: updatedUser.avatarUrl || '',
        bio: updatedUser.bio || ''
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

