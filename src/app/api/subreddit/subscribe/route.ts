import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SubredditSubscriptionValidator } from '@/lib/validators/subreddit';
import { getAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuth();

    if(!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { subredditId } = SubredditSubscriptionValidator.parse(body);

    const subscriptionExists = await prisma.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id
      }
    });

    if(subscriptionExists) {
      return NextResponse.json(
        { message: 'Already subscribed' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        subredditId,
        userId: session.user.id
      }
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (err) {
    if(err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Could not subscribe to subreddit' },
      { status: 500 }
    );
  }
}
