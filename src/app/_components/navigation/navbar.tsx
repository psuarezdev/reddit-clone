import Logo from '@/components/logo';
import { getAuth } from '@/lib/auth';
import SignInButton from '@/components/sign-in-button';
import UserAccountNav from './user-account-nav';
import SearchBar from './searchbar';

export default async function Navbar() {
  const session = await getAuth();

  return (
    <header className="fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-10 py-2">
      <nav className="container flex items-center justify-between gap-2 max-w-7xl h-full mx-auto">
        <Logo />
        <SearchBar />
        {session?.user ? <UserAccountNav user={session.user} /> : <SignInButton />}
      </nav>
    </header>
  );
}
