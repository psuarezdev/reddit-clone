'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { ImageIcon, Link2 } from 'lucide-react';
import UserAvatar from '@/components/user-avatar';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MiniCreatePostProps {
  session: Session | null;
}

export default function MiniCreatePost({ session }: MiniCreatePostProps) {
  const onOpenAuthModal = useAuthModal(state => state.onOpen);
  const router = useRouter();
  const pathname = usePathname();

  const onClick = () => {
    !session
      ? onOpenAuthModal()
      : router.push(`${pathname}/submit`);
  };

  if (!session) return null;

  return (
    <div className="bg-white shadow rounded-md overflow-hidden py-5">
      <div className="h-full px-6 py-4 flex justify-between gap-4">
        <div className="relative">
          <UserAvatar user={session.user} />
          <span className="absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white" />
        </div>
        <Input
          placeholder="Create a post"
          onClick={onClick}
          readOnly
        />
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClick}>
            <ImageIcon className="text-zinc-600" />
          </Button>
          <Button variant="ghost" onClick={onClick}>
            <Link2 className="text-zinc-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
