'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CommentReq } from '@/lib/validators/comment';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

export default function CreateComment({ postId, replyToId }: CreateCommentProps) {
  const onOpenAuthModal = useAuthModal(state => state.onOpen);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [comment, setComment] = useState('');

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
      toast({
        title: 'An error occurred',
        description: 'Failed to post your comment',
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      setComment('');
      router.refresh();
    }
  });

  const handleClick = () => {
    if(!session?.user) return onOpenAuthModal();
    mutate({ postId, text: comment, replyToId });
  };

  return (
    <div className="grid gap-1.5 w-full">
      <Label htmlFor="comment">Your comment</Label>
      <div className="mt-2">
        <Textarea
          className="focus-visible:ring-1"
          id="comment"
          placeholder="What are your thoughts?"
          rows={1}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <div className="flex items-center justify-end mt-2">
          <Button onClick={handleClick} disabled={isPending || comment.length === 0}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
