'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { CreateSubredditPayload } from '@/lib/validators/subreddit';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function CreateComunnity() {
  const router = useRouter();
  const [name, setName] = useState('');
  const { toast } = useToast();


  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const payload: CreateSubredditPayload = { name };

        if(payload.name.trim().toLowerCase() === 'create') {
          return toast({
            title: 'Error',
            description: 'The community name is reserved.',
            variant: 'destructive'
          });
        }

        const res = await fetch('/api/subreddit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if(!res.ok) throw new Error('An error occurred while creating the community.');

        toast({
          title: 'Success',
          description: 'The community has been created.',
          variant: 'success'
        });

        return await res.json();
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive'
        });
      }
    },
    onSuccess: (data) => {
      setName('');
      router.push(`/r/${data.name}`);
    }
  });

  return (
    <main className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create a community</h1>
        </header>
        <hr className="bg-zinc-500 h-px" />
        <section>
          <h3 className="text-lg font-medium">Name</h3>
          <p className="text-md text-zinc-500 mb-4">
            Community names including capitalization cannot be changed.
          </p>
          <div className="relative">
            <p className="absolute left-0 inset-y-0 grid place-items-center w-8 text-sm text-zinc-400">
              r/
            </p>
            <Input
              className="pl-6 focus-visible:ring-0 focus-visible:ring-offset-0"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </section>
        <footer className="flex items-center justify-end gap-3 mt-4">
          <Button
            variant="ghost"
            disabled={isPending || name.trim().length === 0}
            onClick={() => setName('')}
          >
            Cancel
          </Button>
          <Button
            disabled={isPending || name.trim().length === 0}
            onClick={() => mutate()}
          >
            Create Community
          </Button>
        </footer>
      </div>
    </main>
  );
}
