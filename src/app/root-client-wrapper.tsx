'use client';

import dynamic from 'next/dynamic';

const ClientLayout = dynamic(() => import('./client-layout.js'), { ssr: false });

export default function RootClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
} 