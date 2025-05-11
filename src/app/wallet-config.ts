'use client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// 设置网络
export const network = WalletAdapterNetwork.Mainnet;

// 设置 RPC 端点
export const endpoint = (() => {
  const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  if (HELIUS_API_KEY) {
    return `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  }
  // 如果没有 Helius API 密钥，则使用默认的集群 URL
  return clusterApiUrl(network);
})();

// 设置钱包
export const wallets = [new PhantomWalletAdapter()]; 