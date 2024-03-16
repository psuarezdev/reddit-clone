'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';

export default function CreateComunnityButton() {
  const router = useRouter();
  const { data: session } = useSession();
  const onOpen = useAuthModal(state => state.onOpen);

  const onClick = () => {
    if(!session?.user) return onOpen();
    router.push('/r/create');
  };

  return (
    <Button className="w-full mt-4 mb-6" onClick={onClick}>
      Create Community
    </Button>
  );
}
