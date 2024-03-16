'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import LogoIcon from '@/components/icons/logo';
import GithubIcon from '@/components/icons/github';

export default function AuthModal() {
  const { isOpen, onClose } = useAuthModal();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signIn('github');

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in with GitHub',
        variant: 'success'
      });

      onClose();
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description: 'There was an error while trying to sign in with Google',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-zinc-900 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-center text-black text-3xl font-bold">
            <LogoIcon className="w-6 h-6 mx-auto" />
            Welcome back
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-700">
            By continuing, you agree to our User Agreement and Privacy Policy.
          </DialogDescription>
        </DialogHeader>
        <div className="container flex items-center justify-center pb-8">
          <Button size="sm" className="w-full" disabled={isLoading} onClick={loginWithGoogle}>
            <GithubIcon className="w-4 h-4 mr-2" /> 
            <span className="hidden sm:inline">Sign in with</span> GitHub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
