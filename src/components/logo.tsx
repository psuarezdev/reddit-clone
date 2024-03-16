import Link from 'next/link';
import LogoIcon from '@/components/icons/logo';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LogoIcon className="w-8 h-8 lg:w-10 lg:h-10" />
      <span className="hidden md:block text-zinc-700 text-lg font-medium">Reddit</span>
    </Link>
  );
}
