
import { notFound } from 'next/navigation';
import { INFINITE_SCROLL_PAGINATION_LIMIT } from '@/config';
import { getAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import PostFeed from '@/components/posts/post-feed';

export default async function CustomFeed() {
  const session = await getAuth();

  if (!session) return notFound();

  const followedCommunities = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      subreddit: true,
    }
  });

  const posts = await prisma.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedCommunities.map(({ subreddit }) => subreddit.name),
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLL_PAGINATION_LIMIT
  });

  return <PostFeed initialPosts={posts} />;
}