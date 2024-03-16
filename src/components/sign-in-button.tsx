'use client';

import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';

export default function SignInButton() {
  const onOpen = useAuthModal(state => state.onOpen);

  return (
    <Button onClick={onOpen}>Sign In</Button>
  );
}
