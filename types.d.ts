interface Window {
  phantom?: {
    solana?: {
      isPhantom?: boolean;
      connect: (opts?: any) => Promise<any>;
      disconnect: () => Promise<void>;
      forgetConnect?: () => void;
    }
  },
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<any>;
    disconnect: () => Promise<void>;
    forgetConnect?: () => void;
  }
} 