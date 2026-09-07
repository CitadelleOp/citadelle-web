import type { FC, ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { type Chain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const citadelleNetwork = {
  id: Number(import.meta.env.VITE_NETWORK_ID) as number,
  name: import.meta.env.VITE_NETWORK_NAME as string,
  nativeCurrency: { name: 'RBH', symbol: 'RBH', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_NETWORK_RPC as string] },
    public: { http: [import.meta.env.VITE_NETWORK_RPC as string] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: import.meta.env.VITE_EXPLORER_URL as string },
  },
} as const satisfies Chain;

const queryClient = new QueryClient();

const config = createConfig({
  chains: [citadelleNetwork],
  transports: {
    [citadelleNetwork.id]: http(),
  },
});

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
