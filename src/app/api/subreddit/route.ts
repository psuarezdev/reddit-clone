import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SubredditValidator } from '@/lib/validators/subreddit';
import { getAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getAuth();

    if(!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }   

    const { name } = SubredditValidator.parse(body);

    const subredditExists = await prisma.subreddit.findFirst({ where: { name } });

    if(subredditExists) {
      return NextResponse.json(
        { message: 'Subreddit already exists' },
        { status: 409 }
      );
    }

    const subreddit = await prisma.subreddit.create({
      data: {
        name,
        creatorId: session.user.id
      }
    });

    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: subreddit.id
      }
    });

    return NextResponse.json(subreddit, { status: 201 });
  } catch (err) {
    if(err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}