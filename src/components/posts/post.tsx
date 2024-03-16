'use client';

import { useRef } from 'react';
import { Post, User, Vote } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import EditorOutPut from '../../app/r/[subredditName]/_components/editor-output';
import PostVoteClient from './post-vote/post-vote-client';

type PartialVote = Pick<Vote, 'type'>;

interface PostProps {
  subredditName: string;
  post: Post & {
    author: User;
    votes: Vote[];
  };
  commentAmount: number;
  votesAmmount: number;
  currentVote?: PartialVote;
}

export default function Post({ subredditName, post, commentAmount, votesAmmount, currentVote }: PostProps) {
  const postRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-md bg-white shadow">
      <div className="flex items-center justify-between px-6 py-4">
        <PostVoteClient
          postId={post.id}
          initialVotesAmount={votesAmmount}
          initialVote={currentVote?.type}
        />
        <div className="flex-1 w-0">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            {subredditName && (
              <>
                <a className="underline text-zinc-900 text-sm underline-offset-2" href={`/r/${subredditName}`}>
                  r/{subredditName}
                </a>
                <span className="px-1">•</span>
              </>
            )}
            <span>Posted by u/{post.author.name}</span>{' '}
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h2 className="text-xl font-semibold py-1 leading-6 text-gray-900">
              {post.title}
            </h2>
          </a>
          <div className="relative text-sm max-h-40 w-full overflow-clip" ref={postRef}>
            <EditorOutPut content={post.content} />
            {postRef.current?.clientHeight === 160 && (
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
            )}
          </div>
          P</div>
      </div>
      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <a className="flex items-center gap-2 w-fit" href={`/r/${subredditName}/post/${post.id}`}>
          <MessageSquare className="w-4 h-4" /> {commentAmount} Comment{commentAmount !== 1 && 's'}
        </a>
      </div>
    </div>
  );
}
