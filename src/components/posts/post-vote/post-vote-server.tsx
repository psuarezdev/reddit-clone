import { notFound } from 'next/navigation';
import { Post, Vote } from '@prisma/client';
import { getAuth } from '@/lib/auth';
import PostVoteClient from './post-vote-client';

interface PostVoteServerProps {
  postId: string;
  initialVotesAmount?: number;
  initialVote?: Vote['type'] | null;
  getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
}

export default async function PostVoteServer({ postId, initialVotesAmount, initialVote, getData }: PostVoteServerProps) {
  const session = await getAuth();

  let votesAmmount: number = 0;
  let currentVote: Vote['type'] | null | undefined = undefined;

  if (getData) {
    const post = await getData();
    if (!post) return notFound();

    votesAmmount = post.votes.reduce((acc, vote) => acc + (vote.type === 'UP' ? 1 : -1), 0);
    currentVote = post.votes.find(({ userId }) => userId === session?.user?.id)?.type;
  } else {
    votesAmmount = initialVotesAmount!;
    currentVote = initialVote;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVotesAmount={votesAmmount}
      initialVote={currentVote}
    />
  );
}