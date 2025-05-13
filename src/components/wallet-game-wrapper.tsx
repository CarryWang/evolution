// src/components/wallet-game-wrapper.tsx
'use client';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { endpoint } from '../app/wallet-config';    
import GameBoard from './game-board';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useMemo } from 'react';

export default function WalletGameWrapper() {
    // 简化钱包配置
    const wallets = useMemo(() => [
      new PhantomWalletAdapter()
    ], []);
    

    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider 
          wallets={wallets}
          autoConnect = {false}
        >
          <WalletModalProvider>
            <GameBoard />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
}