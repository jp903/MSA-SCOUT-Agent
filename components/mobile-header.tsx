'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/user-types';

interface MobileHeaderProps {
  user: User | null;
  showAuthModal: () => void;
}

export function MobileHeader({ user, showAuthModal }: MobileHeaderProps) {
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="text-lg font-bold">MSASCOUT</div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden sm:block">
              {user.first_name} {user.last_name}
            </span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={showAuthModal}
            className="hidden sm:flex"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}