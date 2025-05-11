'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// 支持的语言
type Language = 'zh' | 'en';

// 上下文类型
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 上下文提供者组件
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 使用上下文的钩子
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage 必须在 LanguageProvider 内部使用');
  }
  return context;
} 