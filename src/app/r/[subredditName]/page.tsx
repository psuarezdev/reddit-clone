import { notFound } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import MiniCreatePost from './_components/mini-create-post';
import PostFeed from '../../../components/posts/post-feed';
import { INFINITE_SCROLL_PAGINATION_LIMIT } from '@/config';

interface SubredditProps {
  params: {
    subredditName: string
  };
}

export default async function Subreddit({ params }: SubredditProps) {
  const session = await getAuth();

  const subreddit = await prisma.subreddit.findUnique({
    where: { name: params.subredditName },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: INFINITE_SCROLL_PAGINATION_LIMIT
      }
    },
  });
  
  if(!subreddit) return notFound();

  return (
    <>
      <h1 className="txt-3xl md:text-4xl h-14 font-bold">r/{subreddit.name}</h1>
      <MiniCreatePost session={session} />
      <PostFeed 
        initialPosts={subreddit.posts} 
        subredditName={subreddit.name} 
      />
    </>
  );
}
