'use client';
import dynamic from 'next/dynamic';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

// 动态导入样式
import '@solana/wallet-adapter-react-ui/styles.css';

// 使用环境变量配置 Helius RPC endpoint
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const HELIUS_RPC_ENDPOINT = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

function ClientProviders({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  // 检查 API key 是否存在
  if (!HELIUS_API_KEY) {
    console.error('Helius API key is not configured');
  }

  return (
    <ConnectionProvider endpoint={HELIUS_RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default dynamic(() => Promise.resolve(ClientProviders), {
  ssr: false
}); 