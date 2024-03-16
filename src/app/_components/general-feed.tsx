import { INFINITE_SCROLL_PAGINATION_LIMIT } from '@/config';
import prisma from '@/lib/prisma';
import PostFeed from '@/components/posts/post-feed';

export default async function GeneralFeed() {
  const posts = await prisma.post.findMany({
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
  })

  return <PostFeed initialPosts={posts} />;
}