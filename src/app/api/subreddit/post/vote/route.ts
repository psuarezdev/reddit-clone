import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Vote } from '@prisma/client';
import { CachedPost } from '@/types/redis.d';
import prisma from '@/lib/prisma';
import { PostVoteValidator } from '@/lib/validators/vote';
import { redis } from '@/lib/redis';
import { getAuth } from '@/lib/auth';

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const { postId, voteType } = PostVoteValidator.parse(body);

    const session = await getAuth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        postId
      }
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId
      },
      include: {
        author: true,
        votes: true
      }
    });

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await prisma.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id
            }
          }
        });

        const votesAmt = post.votes.reduce((acc: number, vote: Vote) => acc + (vote.type === 'UP' ? 1 : -1), 0);

        if (votesAmt >= CACHE_AFTER_UPVOTES) {
          const cachePayload: CachedPost = {
            authorName: post.author.name ?? '',
            content: JSON.stringify(post.content),
            id: post.id,
            title: post.title,
            currentVote: null,
            createdAt: post.createdAt
          };

          await redis.hset(`post:${postId}`, cachePayload as any);
        }

        return NextResponse.json({ message: 'OK' });
      }

      await prisma.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id
          }
        },
        data: {
          type: voteType
        }
      });

      const votesAmt = post.votes.reduce((acc: number, vote: Vote) => acc + (vote.type === 'UP' ? 1 : -1), 0);

      if (votesAmt >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          authorName: post.author.name ?? '',
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote: voteType,
          createdAt: post.createdAt
        };

        await redis.hset(`post:${postId}`, cachePayload as any);
      }

      return NextResponse.json({ message: 'OK' });
    }

    await prisma.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId
      }
    });

    const votesAmt = post.votes.reduce((acc: number, vote: Vote) => acc + (vote.type === 'UP' ? 1 : -1), 0);

    if (votesAmt >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        authorName: post.author.name ?? '',
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        currentVote: voteType,
        createdAt: post.createdAt
      };

      await redis.hset(`post:${postId}`, cachePayload as any);
    }

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