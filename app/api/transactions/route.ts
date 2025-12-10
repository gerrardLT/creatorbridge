import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/transactions - Get user's transactions with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // REGISTER | PURCHASE | SALE
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format'); // json | csv

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { userId };

    if (type && ['REGISTER', 'PURCHASE', 'SALE'].includes(type)) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      hash: tx.txHash,
      date: tx.createdAt.toISOString(),
      assetId: tx.assetId,
      assetTitle: tx.assetTitle
    }));

    // Return CSV if requested
    if (format === 'csv') {
      const csvHeaders = 'ID,Type,Amount,Hash,Date,Asset ID,Asset Title\n';
      const csvRows = formattedTransactions.map(tx =>
        `"${tx.id}","${tx.type}","${tx.amount}","${tx.hash}","${tx.date}","${tx.assetId || ''}","${tx.assetTitle}"`
      ).join('\n');

      return new NextResponse(csvHeaders + csvRows, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions_${userId}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      transactions: formattedTransactions,
      total: formattedTransactions.length
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
