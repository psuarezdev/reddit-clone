import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q');

    if(!query || query.length === 0) {
      return NextResponse.json(
        { message: 'Invalid search query.' },
        { status: 400 }
      );
    }

    const communities = await prisma.subreddit.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        }
      },
      include: {
        _count: true
      },
      take: 5
    });

    return NextResponse.json(communities);
  } catch (err) {
    return NextResponse.json(
      { message: 'An error occurred while searching for communities.' },
      { status: 500 }
    );
  }
}