import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Editor from './_components/editor';

interface SubmitProps {
  params: {
    subredditName: string
  };
}

export default async function CreatePost({ params }: SubmitProps) {
  const subreddit = await prisma.subreddit.findUnique({
    where: {
      name: params.subredditName
    }
  });

  if (!subreddit) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-baseline flex-wrap -ml-2 -mt-2">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in r/{subreddit.name}
          </p>
        </div>
      </div>
      <Editor subredditId={subreddit.id} />
      <div className="flex items-center justify-end w-full">
        <Button type="submit" className="w-full" form="subreddit-post-form">
          Post
        </Button>
      E</div>
    </div>
  );
}
