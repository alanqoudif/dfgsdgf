"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/app/language-context';

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`px-3 py-2 rounded-full transition-all duration-300 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}
    >
      {language === 'ar' ? 'English' : 'عربي'}
    </Button>
  );
} 