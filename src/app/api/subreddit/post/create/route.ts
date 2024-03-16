import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PostValidator } from '@/lib/validators/post';

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

    const { title, content, subredditId } = PostValidator.parse(body);

    const subscriptionExists = await prisma.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id
      }
    });

    if(!subscriptionExists) {
      return NextResponse.json(
        { message: 'Subscribe to post' },
        { status: 400 }
      );
    }

    await prisma.post.create({
      data: {
        title,
        content,
        subredditId,
        authorId: session.user.id
      }
    });

    return NextResponse.json(
      { message: 'Post created' },
      { status: 201 }
    );
  } catch (err) {
    if(err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Could not post to subreddit' },
      { status: 500 }
    );
  }
}
