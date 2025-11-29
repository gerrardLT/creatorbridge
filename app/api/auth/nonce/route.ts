import { NextRequest, NextResponse } from 'next/server';
import { generateNonce, generateSignInMessage } from '@/lib/auth';

// GET /api/auth/nonce - Generate nonce for wallet sign-in
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  const nonce = generateNonce();
  const message = generateSignInMessage(address, nonce);

  return NextResponse.json({ nonce, message });
}
