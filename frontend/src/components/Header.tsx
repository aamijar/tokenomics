import { ModeToggle } from '@/components/ui/mode-toggle';
import { WALLETCONNECT_PROJECT_ID } from '@/config';
import Logo from '@/components/Logo';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="font-semibold text-lg">Tokenomics</div>
        </div>
        <div className="flex items-center gap-3">
          {WALLETCONNECT_PROJECT_ID ? (
            <ConnectButton chainStatus="icon" showBalance={false} />
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
