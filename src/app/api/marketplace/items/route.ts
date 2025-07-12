import { NextResponse } from 'next/server';
import { items } from '@/lib/marketplace-data';

export async function GET() {
  return NextResponse.json(items);
}
