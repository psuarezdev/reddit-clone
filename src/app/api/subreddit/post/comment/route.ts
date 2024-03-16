import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import { CommentValidator } from '@/lib/validators/comment';
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

    const { postId, text, replyToId } = CommentValidator.parse(body);

    await prisma.comment.create({
      data: {
        text,
        postId,
        replyToId,
        authorId: session.user.id
      }
    });

    return NextResponse.json(
      { message: 'Comment created' },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Could not create comment' },
      { status: 500 }
    );
  }
}