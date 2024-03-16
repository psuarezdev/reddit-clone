import { HomeIcon } from 'lucide-react';
import { getAuth } from '@/lib/auth';
import CreateComunnityButton from './_components/create-comunnity-button';
import CustomFeed from './_components/custom-feed';
import GeneralFeed from './_components/general-feed';

export default async function Home() {
  const session = await getAuth();

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-bold">Your feed</h1>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        {session?.user ? <CustomFeed /> : <GeneralFeed />}
        <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
          <div className="bg-emerald-100 px-6 py-4">
            <p className="font-semibold py-3 flex items-center gap-1.5">
              <HomeIcon className="w-4 h-4 mr-2" /> Home
            </p>
          </div>
          <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex items-center justify-between gap-x-4 py-3">
              <p className="text-zinc-500">
                Your personal Reddit homepage. Visit your favourite communities here.
              </p>
            </div>
            <CreateComunnityButton />
          </div>
        </div>
      </section>
    </main>
  );
}
