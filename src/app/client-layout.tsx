'use client'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
// 导入钱包适配器样式
import '@solana/wallet-adapter-react-ui/styles.css';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 使用 Helius RPC endpoint
  const endpoint = useMemo(() => {
    const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
      console.error('Helius API key is not configured');
      return clusterApiUrl(WalletAdapterNetwork.Mainnet);
    }
    return `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  }, []);

  // 配置钱包
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <LanguageProvider>
            <div className="container">
              {children}
            </div>
          </LanguageProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 