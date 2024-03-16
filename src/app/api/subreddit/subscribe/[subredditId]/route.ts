import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { subredditId: string } }) {
  try {
    const session = await getAuth();
    const { subredditId } = params;

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscriptionExists = await prisma.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id
      }
    });

    if (!subscriptionExists) {
      return NextResponse.json(
        { message: 'Subscription does not exist' },
        { status: 400 }
      );
    }

    const subreddit = await prisma.subreddit.findUnique({
      where: {
        id: subredditId,
        creatorId: session.user.id
      }
    });

    if (subreddit) {
      return NextResponse.json(
        { message: 'Cannot unsubscribe from your own subreddit' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.delete({
      where: {
        userId_subredditId: {
          userId: session.user.id,
          subredditId
        }
      }
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
