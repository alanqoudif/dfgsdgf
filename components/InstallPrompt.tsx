import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/app/language-context';
import Image from 'next/image';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'chrome' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { language, translate } = useLanguage();

  useEffect(() => {
    const isDismissed = localStorage.getItem('installPromptDismissed');
    if (isDismissed) return;

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && /google inc/.test(navigator.vendor.toLowerCase());

    if (isIOSDevice) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else if (isChrome) setPlatform('chrome');

    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });

    // Show prompt for iOS after delay
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  const getInstructions = () => {
    switch (platform) {
      case 'ios':
        return (
          <p className="text-neutral-600 dark:text-neutral-400">
            {translate(
              "اضغط على", 
              "Tap"
            )} <Share className={`inline h-4 w-4 ${language === 'ar' ? 'mr-1 ml-1' : 'mx-1'}`} /> {translate(
              "ثم",
              "and then"
            )}{" "}
            <span className="whitespace-nowrap">
              {translate(
                "\"إضافة إلى الشاشة الرئيسية\"",
                "\"Add to Home Screen\""
              )} <Plus className={`inline h-4 w-4 ${language === 'ar' ? 'mr-1' : 'ml-1'}`} />
            </span>
          </p>
        );
      case 'android':
        return (
          <p className="text-neutral-600 dark:text-neutral-400">
            {translate(
              "اضغط على القائمة",
              "Tap the menu"
            )} <span className="font-bold">⋮</span> {translate(
              "ثم اختر \"تثبيت التطبيق\"",
              "and select \"Install app\""
            )}
          </p>
        );
      default:
        return (
          <p className="text-neutral-600 dark:text-neutral-400">
            {translate(
              "قم بتثبيت التطبيق للحصول على تجربة أفضل",
              "Install our app for a better experience"
            )} <Download className={`inline h-4 w-4 ${language === 'ar' ? 'mr-1' : 'ml-1'}`} />
          </p>
        );
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed top-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96"
        >
          <Card className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <div className="flex items-start justify-between">
              <div className={`flex items-center gap-3 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}>
                <Image 
                  src="/dhaki_logo-removebg-preview.png" 
                  width={40} 
                  height={40} 
                  alt="ذكي" 
                  className="object-contain" 
                />
                <div className="space-y-2">
                  <h3 className="font-medium text-xl text-neutral-900 dark:text-neutral-100">
                    {translate("تثبيت ذكي", "Install Dhaki")}
                  </h3>
                  {getInstructions()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>

            {platform !== 'ios' && (
              <div className={`mt-4 flex justify-end gap-2 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDismiss}
                >
                  {translate("ربما لاحقًا", "Maybe later")}
                </Button>
                <Button
                  size="sm"
                  onClick={handleInstall}
                >
                  {translate("تثبيت", "Install")}
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
