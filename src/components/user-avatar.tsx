'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'next-auth';
import { User as UserIcon } from 'lucide-react';
import { AvatarProps } from '@radix-ui/react-avatar';

interface UserAvatarProps extends AvatarProps {
  user: User | null;
}

export default function UserAvatar({ user, ...props }: UserAvatarProps) {
  if(!user) return null;

  return (
    <Avatar {...props}>
      {
        !user.image ? (
          <AvatarFallback>
            <span className="sr-only">{user.name}</span>
            <UserIcon className="w-4 h-4" />
          </AvatarFallback>
        ) : (
          <div className="relative aspect-square w-full h-full">
            <Image
              className="rounded-full hover:opacity-80 transition-opacity duration-200 ease-in-out"
              src={user.image}
              alt={`${user.name}'s avatar`}
              referrerPolicy="no-referrer"
              width={40}
              height={40}
            />
          </div>
        )
      }
    </Avatar>
  );
}
