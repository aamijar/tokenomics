import { Wallet } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { WALLETCONNECT_PROJECT_ID } from '@/config';

export function Header() {
  return (
    <header className="w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">FX</div>
          <div className="font-semibold">Flexi Swap Hub</div>
        </div>
        <div className="flex items-center gap-3">
          {WALLETCONNECT_PROJECT_ID ? (
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
              <Wallet className="size-4" />
              <span>Connect Wallet</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Wallet disabled. Set VITE_WALLETCONNECT_PROJECT_ID to enable.
            </div>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
