import React, { ReactNode, useMemo } from "react";
import { getDefaultConfig, RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WALLETCONNECT_PROJECT_ID } from "@/config";

export function Providers({ children }: { children: ReactNode }) {
  const enabled = Boolean(WALLETCONNECT_PROJECT_ID);
  const config = useMemo(() => {
    if (!enabled) return null as unknown as ReturnType<typeof getDefaultConfig>;
    return getDefaultConfig({
      appName: "Tokenomics",
      projectId: WALLETCONNECT_PROJECT_ID as string,
      chains: [mainnet, base],
      ssr: false,
    });
  }, [enabled]);

  const queryClient = useMemo(() => new QueryClient(), []);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" theme={{ lightMode: lightTheme(), darkMode: darkTheme() }}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
