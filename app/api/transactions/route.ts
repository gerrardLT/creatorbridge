import { NextRequest, NextResponse } from 'next/server';
import { findTransactionsByUser } from '@/lib/db';

// GET /api/transactions - Get user's transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const transactions = await findTransactionsByUser(userId);

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      hash: tx.txHash,
      date: tx.createdAt.toISOString(),
      assetId: tx.assetId,
      assetTitle: tx.assetTitle
    }));

    return NextResponse.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
