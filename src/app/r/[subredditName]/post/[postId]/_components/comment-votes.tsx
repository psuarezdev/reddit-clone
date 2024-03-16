'use client';

import { useEffect, useState } from 'react';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { VoteType } from '@prisma/client';
import { usePrevious } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { CommentVoteReq, PostVoteReq } from '@/lib/validators/vote';
import { cn } from '@/lib/utils';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

interface CommentVoteProps {
  commentId: string;
  initialVotesAmount: number;
  initialVote?: VoteType | null;
}

export default function CommentVote({ commentId, initialVotesAmount, initialVote }: CommentVoteProps) {
  const [votesAmount, setVotesAmount] = useState(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);

  const { data: session } = useSession();
  const onOpenAuthModal = useAuthModal(state => state.onOpen);
  const prevVote = usePrevious(currentVote);

  const { mutate } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: CommentVoteReq = { voteType: type, commentId };

      await fetch('/api/subreddit/post/comment/vote', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },
    onError: (_, voteType) => {
      voteType === 'UP'
        ? setVotesAmount(prev => prev - 1)
        : setVotesAmount(prev => prev + 1);

      setCurrentVote(prevVote);
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        setCurrentVote(undefined);

        if (type === 'UP') {
          setVotesAmount(prev => prev - 1);
        } else if (type === 'DOWN') {
          setVotesAmount(prev => prev + 1);
        }
      } else {
        setCurrentVote(type);

        if (type === 'UP') {
          setVotesAmount(prev => prev + (currentVote ? 2 : 1));
        } else if (type === 'DOWN') {
          setVotesAmount(prev => prev - (currentVote ? 2 : 1));
        }
      }
    }
  });

  const handleVote = (voteType: VoteType) => {
    if (!session?.user) return onOpenAuthModal();
    mutate(voteType);
  };

  return (
    <div className="flex gap-1">
      <Button
        onClick={() => handleVote('UP')}
        size="sm"
        variant="ghost"
        aria-label="upvote">
        <ArrowBigUp
          className={cn('h-5 w-5 text-zinc-700', {
            'text-emerald-500 fill-emerald-500': currentVote === "UP",
          })}
        />
      </Button>
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmount}
      </p>
      <Button
        onClick={() => handleVote('DOWN')}
        size="sm"
        className={cn({
          "text-emerald-500": currentVote === 'DOWN',
        })}
        variant="ghost"
        aria-label="downvote">
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            'text-red-500 fill-red-500': currentVote === 'DOWN',
          })}
        />
      </Button>
    </div>
  );
}
