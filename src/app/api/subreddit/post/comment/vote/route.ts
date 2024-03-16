import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { CommentVoteValidator } from '@/lib/validators/vote';
import { getAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const session = await getAuth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const existingVote = await prisma.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId
      }
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        await prisma.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id
            }
          }
        });

        return NextResponse.json({ message: 'OK' });
      }

      await prisma.commentVote.update({
        where: {
          userId_commentId: {
            commentId,
            userId: session.user.id
          }
        },
        data: {
          type: voteType,

        }
      });

      return NextResponse.json({ message: 'OK' });
    }

    await prisma.commentVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        commentId
      }
    });

    return NextResponse.json({ message: 'OK' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Could not post to subreddit at this time. Please try later' },
      { status: 500 }
    );
  }
}