"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: string;
  direction: Direction;
  toggleLanguage: () => void;
  translate: (arabicText: string, englishText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string>('ar');
  const [direction, setDirection] = useState<Direction>('rtl');

  useEffect(() => {
    // Check if there's a language preference stored in localStorage
    const storedLanguage = localStorage.getItem('language') || 'ar';
    setLanguage(storedLanguage);
    setDirection(storedLanguage === 'ar' ? 'rtl' : 'ltr');
    
    // Update the document direction
    document.documentElement.dir = storedLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // Set the appropriate font family based on language
    if (storedLanguage === 'ar') {
      document.documentElement.classList.add('font-tajawal');
      document.documentElement.classList.remove('font-montserrat');
    } else {
      document.documentElement.classList.add('font-montserrat');
      document.documentElement.classList.remove('font-tajawal');
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
    
    const newDirection = newLanguage === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    
    // Update localStorage
    localStorage.setItem('language', newLanguage);
    
    // Update the document direction
    document.documentElement.dir = newDirection;
    
    // Update the font family
    if (newLanguage === 'ar') {
      document.documentElement.classList.add('font-tajawal');
      document.documentElement.classList.remove('font-montserrat');
    } else {
      document.documentElement.classList.add('font-montserrat');
      document.documentElement.classList.remove('font-tajawal');
    }
  };

  // Helper function to translate text based on current language
  const translate = (arabicText: string, englishText: string): string => {
    return language === 'ar' ? arabicText : englishText;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 