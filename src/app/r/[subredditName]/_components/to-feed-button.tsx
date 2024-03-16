'use client';

import { ChevronLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ToFeedButton() {
  const pathname = usePathname();
  const subredditPath = getSubredditPath(pathname);

  return (
    <Button variant="ghost" asChild>
      <a href={subredditPath}>
        <ChevronLeft className='w-4 h-4 mr-1' />
        {subredditPath === '/' ? 'Back home' : 'Back to community'}
      </a>
    </Button>
  );
}

function getSubredditPath(pathname: string) {
  const splitPath = pathname.split('/');

  if (splitPath.length === 3) return '/';
  if (splitPath.length > 3) return `/${splitPath[1]}/${splitPath[2]}`;

  return '/';
}