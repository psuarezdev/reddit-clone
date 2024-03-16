import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const session = await getAuth();

    let followedCommunitiesIds: string[] = [];

    if (session?.user) {
      const followedCommunities = await prisma.subscription.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          subreddit: true
        }
      });

      followedCommunitiesIds = followedCommunities.map(({ subreddit }) => subreddit.id);
    }

    const { limit, page, subredditName } = z.object({
      limit: z.string(),
      page: z.string(),
      subredditName: z.string().nullish().optional()
    }).parse({
      limit: searchParams.get('limit'),
      page: searchParams.get('page'),
      subredditName: searchParams.get('subredditName'),
    });

    let query = {};

    if (subredditName) {
      query = {
        subreddit: {
          name: subredditName
        }
      };
    } else if (session?.user) {
      query = {
        subredditId: {
          in: followedCommunitiesIds
        }
      };
    }

    const posts = await prisma.post.findMany({
      where: query,
      include: {
        author: true,
        subreddit: true,
        votes: true,
        comments: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    return NextResponse.json(posts);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Could not get the posts' },
      { status: 500 }
    );
  }
}