import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';
import { Post, Vote, User } from '@prisma/client';
import { CachedPost } from '@/types/redis.d';
import { redis } from '@/lib/redis';
import prisma from '@/lib/prisma';
import PostVoteServer from '@/components/posts/post-vote/post-vote-server';
import { Button } from '@/components/ui/button';
import EditorOutPut from '../../_components/editor-output';
import Comments from './_components/comments';

interface PostProps {
  params: {
    subredditName: string;
    postId: string;
  };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-cache';

export default async function Post({ params }: PostProps) {
  const cachedPost = (await redis.hgetall(`post:${params.postId}`)) as unknown as CachedPost;
  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  if (!cachedPost) {
    post = await prisma.post.findUnique({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
        author: true,
      }
    });
  }

  if (!post && !cachedPost) return notFound();

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-start h-full">
        <Suspense fallback={<PostVoteShell />}>
          <PostVoteServer
            postId={post?.id ?? cachedPost.id}
            getData={async () => {
              return await prisma.post.findUnique({
                where: {
                  id: params.postId
                },
                include: {
                  votes: true
                }
              });
            }}
          />
        </Suspense>
        <div className="flex-1 bg-white w-full sm:w-0 p-4 rounded-sm">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
            Posted by u/{post?.author.name ?? cachedPost.authorName}{' '}
            {formatDistanceToNow(new Date(post?.createdAt ?? cachedPost.createdAt), { addSuffix: true })}
          </p>
          <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
            {post?.title ?? cachedPost.title}
          </h1>
          <EditorOutPut content={post?.content ?? cachedPost.content} />
          <Suspense fallback={<Loader2 className="w-5 h-5 animate-spin text-zinc-500" />}>
            <Comments postId={params.postId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PostVoteShell() {
  return (
    <div className="flex flex-col items-center w-20 pr-6">
      <Button variant="ghost">
        <ArrowBigUp className="w-5 h-5 text-zinc-700" />
      </Button>
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="w-3 h-3 animate-spin" />
      </div>
      <Button variant="ghost">
        <ArrowBigDown className="w-5 h-5 text-zinc-700" />
      </Button>
    </div>
  );
}
