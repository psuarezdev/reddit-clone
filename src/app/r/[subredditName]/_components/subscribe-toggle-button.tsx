'use client';

import { startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { type SubredditSubscriptionPayload } from '@/lib/validators/subreddit';
import { useToast } from '@/components/ui/use-toast';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';

interface SubscribeToggleButtonProps {
  isSubscribed: boolean;
  subredditId: string;
  subredditName: string;
}

export default function SubscribeToggleButton({ isSubscribed, subredditId, subredditName }: SubscribeToggleButtonProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const onOpenAuthModal = useAuthModal(state => state.onOpen);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const payload: SubredditSubscriptionPayload = { subredditId };

      const res = await fetch(`/api/subreddit/subscribe${isSubscribed ? `/${subredditId}` : ''}`, {
        method: isSubscribed ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isSubscribed ? undefined : JSON.stringify(payload)
      });

      return await res.json();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: `Failed to ${isSubscribed ? 'leave' : 'subscribe to'} the community`,
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      toast({
        title: 'Subscribed',
        description: `You're now ${isSubscribed ? 'unsubscribed' : 'subscribed'} to r/${subredditName}`,
        variant: 'success'
      });
    }
  });

  const handleToggleSubscription = () => {
    if (!session?.user) return onOpenAuthModal();
    mutate();
  };

  return (
    <Button className="w-full mt-1 mb-4" onClick={handleToggleSubscription} disabled={isPending}>
      {isPending && <Loader2 className="h-5 w-5 mr-2 animate-spin text-zinc-500" />}
      {isSubscribed ? 'Leave community' : 'Join to post'}
    </Button>
  );
}
