'use client';

import { useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Comment, User, CommentVote, VoteType } from '@prisma/client';
import UserAvatar from '@/components/user-avatar';
import CommentVotes from './comment-votes';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { useSession } from 'next-auth/react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { CommentReq } from '@/lib/validators/comment';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';

type ExtendedComment = Comment & {
  author: User;
  votes: CommentVote[];
};

interface CommentProps {
  comment: ExtendedComment;
  votesAmount: number;
  initialVote?: VoteType | null;
  postId: string;
}

export default function Comment({ comment, votesAmount, initialVote, postId }: CommentProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const onOpenAuthModal = useAuthModal(state => state.onOpen);

  const [isReplying, setIsReplying] = useState(false);
  const [input, setInput] = useState('');
  const commentRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(commentRef, () => setIsReplying(false));

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentReq) => {
      const payload: CommentReq = { postId, text, replyToId };

      const res = await fetch(`/api/subreddit/post/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return await res.json();
    },
    onError: () => {
      return toast({
        title: 'Something went wrong.',
        description: 'Comment wasn\'t created successfully. Please try again.',
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
    },
  });

  const handleClick = () => {
    if (!session?.user) return onOpenAuthModal();
    mutate({ postId, text: input, replyToId: comment.replyToId ?? comment.id });
  };

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          className="w-6 h-6"
          user={comment.author}
        />
        <div className="flex items-center gap-x-2 ml-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.name}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>
      <div className="flex flex-wrap items-center gap-2">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmount}
          initialVote={initialVote}
        />
        <Button
          onClick={() => {
            if (!session?.user) return onOpenAuthModal();
            setIsReplying(true);
          }}
          variant="ghost"
          size="sm"
        >
          <MessageSquare className="w-4 h-4 mr-1.5" /> Reply
        </Button>
        {isReplying && (
          <div className="grid gap-1.5 w-full">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
              <Textarea
                className="focus-visible:ring-1"
                id="comment"
                placeholder="What are your thoughts?"
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div className="flex items-center justify-end mt-2">
                <Button
                  tabIndex={-1}
                  variant="outline"
                  onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button onClick={handleClick} disabled={isPending || input.length === 0}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
