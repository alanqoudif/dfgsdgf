"use client"

import { useState, useEffect } from 'react';

type Direction = 'rtl' | 'ltr';

export function useLanguage() {
  const [language, setLanguage] = useState<string>('ar');
  
  useEffect(() => {
    // Check if there's a language preference stored in localStorage
    const storedLanguage = typeof window !== 'undefined' 
      ? localStorage.getItem('language') || 'ar'
      : 'ar';
    
    setLanguage(storedLanguage);
  }, []);
  
  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
    }
  };
  
  // Helper function to translate text based on current language
  const translate = (arabicText: string, englishText: string): string => {
    return language === 'ar' ? arabicText : englishText;
  };
  
  return {
    language,
    toggleLanguage,
    translate,
    isRTL: language === 'ar'
  };
} 