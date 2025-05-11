'use client';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import { endpoint, wallets } from './wallet-config.js';

// 动态导入样式
import '@solana/wallet-adapter-react-ui/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// 使用动态导入来防止SSR问题
export default dynamic(() => Promise.resolve(Providers), {
  ssr: false
}); 