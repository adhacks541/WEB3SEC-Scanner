import { auth, signIn, signOut } from '@/auth';
import { LogOut, LayoutDashboard, Github } from 'lucide-react';
import Link from 'next/link';

export default async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-[var(--neon-green)] hover:text-white transition-colors font-semibold"
        >
          <LayoutDashboard className="w-4 h-4" />
          DASHBOARD
        </Link>
        
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button 
            type="submit" 
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={async () => {
        'use server';
        await signIn('github', { redirectTo: '/dashboard' });
      }}
    >
      <button 
        type="submit" 
        className="flex items-center gap-2 text-[var(--neon-green)] hover:text-white transition-colors font-semibold"
      >
        <Github className="w-4 h-4" />
        SIGN IN
      </button>
    </form>
  );
}
