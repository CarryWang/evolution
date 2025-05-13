// app/providers.tsx
'use client';

import dynamic from 'next/dynamic';

// 只保留基本功能，不包含钱包适配器
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

export default dynamic(() => Promise.resolve(Providers), { ssr: false });