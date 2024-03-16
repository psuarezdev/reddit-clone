'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Vote } from '@prisma/client';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ExtendedPost } from '@/types/types.d';
import { INFINITE_SCROLL_PAGINATION_LIMIT } from '@/config';
import Post from './post';
import { Loader2 } from 'lucide-react';

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

export default function PostFeed({ initialPosts, subredditName }: PostFeedProps) {
  const { data: session } = useSession();
  const lastPostRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1
  });

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['infinite-posts'],
    initialPageParam: 1,
    initialData: {
      pages: [initialPosts],
      pageParams: [1]
    },
    queryFn: async ({ pageParam }) => {
      let query = `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_LIMIT}&page=${pageParam}`;

      if (!!subredditName) {
        query += `&subredditName=${subredditName}`;
      }

      const res = await fetch(query);
      return await res.json();
    },
    getNextPageParam: (_, pages) => pages.length + 1,
  });

  const posts = data?.pages.flatMap(page => page) ?? initialPosts;

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts?.map((post, index) => {
        const votesAmount = post.votes.reduce((acc: number, vote: Vote) => acc + (vote.type === 'UP' ? 1 : -1), 0);
        const currentVote = post.votes.find((vote: Vote) => vote.userId === session?.user.id);

        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                subredditName={post.subreddit.name}
                post={post}
                commentAmount={post.comments.length}
                votesAmmount={votesAmount}
                currentVote={currentVote}
              />
            </li>
          );
        } else {
          return (
            <Post
              key={post.id}
              subredditName={post.subreddit.name}
              post={post}
              commentAmount={post.comments.length}
              votesAmmount={votesAmount}
              currentVote={currentVote}
            />
          );
        }
      })}
      {isFetchingNextPage && (
        <li className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </li>
      )}
    </ul>
  );
}
