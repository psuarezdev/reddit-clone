'use client';

import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';
import { User } from 'next-auth';

interface CreatePostButtonProps {
  user?: User | null;
  subredditName: string;
}

export default function CreatePostButton({ user, subredditName }: CreatePostButtonProps) {
  const router = useRouter();
  const onOpenAuthModal = useAuthModal(state => state.onOpen);

  const handleClick = () => {
    if(!user) return onOpenAuthModal();
    router.push(`/r/${subredditName}/submit`);
  };

  return (
    <Button className="w-full mb-6" variant="outline" onClick={handleClick}>
      Create Post
    </Button>
  );
}
