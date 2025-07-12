import { NextResponse } from 'next/server';
import { items } from '@/lib/marketplace-data';

export async function GET(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  const { itemId } = params;
  const item = items.find((item) => item.id === itemId);

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json(item);
}
