import { NextRequest, NextResponse } from 'next/server';
import { upsertUser, findUserByWallet, findUserById } from '@/lib/db';

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
    const body = await request.json();
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
        avatarUrl: user.avatarUrl || ''
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
