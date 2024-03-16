import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import SubscribeToggleButton from './_components/subscribe-toggle-button';
import CreatePostButton from './_components/create-post-button';
import ToFeedButton from './_components/to-feed-button';

interface SubredditLayoutProps {
  children: React.ReactNode;
  params: {
    subredditName: string;
  };
}

export default async function SubredditLayout({ children, params }: SubredditLayoutProps) {
  const session = await getAuth();
  const subreddit = await prisma.subreddit.findUnique({
    where: { name: params.subredditName },
    include: {
      posts: {
        include: {
          author: true,
          votes: true
        }
      }
    }
  });

  const subscription = !session?.user
    ? undefined
    : await prisma.subscription.findFirst({
      where: {
        subreddit: {
          name: params.subredditName
        },
        userId: session.user.id
      }
    });

  const isSubscribed = !!subscription;

  if (!subreddit) return notFound();

  const membersCount = await prisma.subscription.count({
    where: {
      subreddit: {
        name: params.subredditName
      }
    }
  });

  return (
    <main className="sm:container max-w-7xl mx-auto h-full pt-12">
      <ToFeedButton />
      <section className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        <div className="flex flex-col col-span-2 space-y-6">{children}</div>
        <div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
          <div className="px-6 py-4">
            <p className="font-semibold py-3">About r/{subreddit.name}</p>
          </div>
          <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
            <div className="flex items-center justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Created</dt>
              <dd className="text-gray-700">
                <time dateTime={subreddit.createdAt.toDateString()}>
                  {format(subreddit.createdAt, 'MMMM d, yyyy')}
                </time>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Members</dt>
              <dd className="text-gray-700">
                <span className="text-gray-900">{membersCount}</span>
              </dd>
            </div>
            {subreddit.creatorId === session?.user?.id && (
              <div className="flex items-center justify-center gap-x-4 py-3">
                <p className="text-gray-500">You created this community</p>
              </div>
            )}
            {subreddit.creatorId !== session?.user?.id && (
              <SubscribeToggleButton
                isSubscribed={isSubscribed}
                subredditId={subreddit.id}
                subredditName={subreddit.name}
              />
            )}
            <CreatePostButton user={session?.user} subredditName={subreddit.name} />
          </dl>
        </div>
      </section>
    </main>
  );
}
