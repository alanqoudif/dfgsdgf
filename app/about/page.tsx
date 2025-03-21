/* eslint-disable @next/next/no-img-element */
"use client";

import { GithubLogo, XLogo } from '@phosphor-icons/react';
import { Bot, Brain, Command, GraduationCap, Image, Search, Share2, Sparkles, Star, Trophy, Users, AlertTriangle, Github, Twitter } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TextLoop } from '@/components/core/text-loop';
import { TextShimmer } from '@/components/core/text-shimmer';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VercelLogo } from '@/components/logos/vercel-logo';
import { TavilyLogo } from '@/components/logos/tavily-logo';
import NextImage from 'next/image';
import { useLanguage } from '@/app/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function AboutPage() {
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { translate, language, direction } = useLanguage();
    
    useEffect(() => {
        setIsMounted(true);
        // Check if user has seen the warning
        if (typeof window !== 'undefined') {
            const hasSeenWarning = localStorage.getItem('hasSeenWarning');
            if (!hasSeenWarning) {
                setShowWarning(true);
            }
        }
    }, []);

    const handleDismissWarning = () => {
        setShowWarning(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('hasSeenWarning', 'true');
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('query')?.toString();
        if (query) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="min-h-screen bg-background overflow-hidden" dir={direction}>
            <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent className="sm:max-w-[425px] p-0 bg-neutral-50 dark:bg-neutral-900">
                    <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                        <DialogHeader>
                            <DialogTitle className={`flex items-center gap-2 text-yellow-600 dark:text-yellow-500 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}>
                                <AlertTriangle className="h-5 w-5" />
                                {translate('تنبيه', 'Warning')}
                            </DialogTitle>
                            <DialogDescription className={`text-neutral-600 dark:text-neutral-400 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}>
                                {translate(
                                    'ذكي هو محرك بحث مدعوم بالذكاء الاصطناعي وليس له علاقة بأي عملات رقمية أو رموز. احذر من المحتالين.',
                                    'Dhaki is an AI-powered search engine and has no connection to any cryptocurrencies or tokens. Beware of scammers.'
                                )}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="p-6 pt-4">
                        <Button 
                            variant="default" 
                            onClick={handleDismissWarning}
                            className={`w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}
                        >
                            {translate('فهمت، شكراً', 'I understand, thanks')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header with language switcher */}
            <div className="absolute top-0 right-0 p-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* Hero Section */}
            <div className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
                            {translate('حول ذكي', 'About Dhaki')}
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl text-neutral-600 dark:text-neutral-300">
                            {translate(
                                'ذكي هو محرك بحث متطور مدعوم بالذكاء الاصطناعي، صُمم لمساعدتك في إيجاد المعلومات بسرعة ودقة.',
                                'Dhaki is an advanced AI-powered search engine designed to help you find information quickly and accurately.'
                            )}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button 
                                onClick={() => router.push('/')}
                                className={`px-6 py-2 rounded-full ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}
                            >
                                {translate('جرب ذكي الآن', 'Try Dhaki Now')}
                            </Button>
                            <Link href="https://github.com/nuqtah/lory" target="_blank">
                                <Button 
                                    variant="outline" 
                                    className={`px-6 py-2 rounded-full flex items-center gap-2 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}
                                >
                                    <Github className="h-4 w-4" />
                                    {translate('GitHub', 'GitHub')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-neutral-50 dark:bg-neutral-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                            {translate('ميزات ذكي', 'Dhaki Features')}
                        </h2>
                        <p className="max-w-3xl mx-auto text-lg text-neutral-600 dark:text-neutral-300">
                            {translate(
                                'تمتلك ذكي مجموعة من الميزات القوية التي تجعلها فريدة من نوعها',
                                'Dhaki offers a set of powerful features that make it unique'
                            )}
                        </p>
                    </div>

                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        <FeatureCard 
                            icon={<Brain className="h-8 w-8" />}
                            title={translate('ذكاء اصطناعي متقدم', 'Advanced AI')}
                            description={translate(
                                'استخدام أحدث نماذج الذكاء الاصطناعي لفهم استفساراتك وتقديم إجابات دقيقة',
                                'Using the latest AI models to understand your queries and provide accurate answers'
                            )}
                        />
                        <FeatureCard 
                            icon={<Search className="h-8 w-8" />}
                            title={translate('بحث متطور', 'Enhanced Search')}
                            description={translate(
                                'قدرة بحث متفوقة تمكنك من العثور على المعلومات بسرعة ودقة',
                                'Superior search capability allowing you to find information quickly and accurately'
                            )}
                        />
                        <FeatureCard 
                            icon={<Image className="h-8 w-8" />}
                            title={translate('دعم الصور', 'Image Support')}
                            description={translate(
                                'القدرة على تحليل وفهم الصور ومعالجتها ضمن استفساراتك',
                                'Ability to analyze and understand images and process them within your queries'
                            )}
                        />
                        <FeatureCard 
                            icon={<Sparkles className="h-8 w-8" />}
                            title={translate('خوارزميات ذكية', 'Smart Algorithms')}
                            description={translate(
                                'خوارزميات متقدمة لتحسين نتائج البحث وتقديم إجابات أكثر ملاءمة',
                                'Advanced algorithms to improve search results and provide more relevant answers'
                            )}
                        />
                        <FeatureCard 
                            icon={<Command className="h-8 w-8" />}
                            title={translate('أدوات متنوعة', 'Various Tools')}
                            description={translate(
                                'مجموعة من الأدوات المفيدة مثل الترجمة والحاسبة وغيرها',
                                'A collection of useful tools such as translation, calculator, and more'
                            )}
                        />
                        <FeatureCard 
                            icon={<Share2 className="h-8 w-8" />}
                            title={translate('مشاركة سهلة', 'Easy Sharing')}
                            description={translate(
                                'إمكانية مشاركة نتائج البحث مع الآخرين بسهولة',
                                'Ability to easily share search results with others'
                            )}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Models Section */}
            <div className="py-16 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                            {translate('نماذج ذكي', 'Dhaki Models')}
                        </h2>
                        <p className="max-w-3xl mx-auto text-lg text-neutral-600 dark:text-neutral-300">
                            {translate(
                                'تعتمد ذكي على مجموعة من أحدث نماذج الذكاء الاصطناعي',
                                'Dhaki is powered by a collection of the latest AI models'
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ModelCard 
                            name={translate('ذكي بلس', 'Dhaki Plus')}
                            description={translate(
                                'نموذج قوي للاستخدامات العامة وأسئلة البحث النصية',
                                'Powerful model for general use and text-based search queries'
                            )}
                        />
                        <ModelCard 
                            name={translate('ذكي بلس للصور', 'Dhaki Plus Vision')}
                            description={translate(
                                'نموذج متخصص في تحليل الصور والإجابة على الأسئلة المتعلقة بها',
                                'Specialized model for analyzing images and answering related questions'
                            )}
                        />
                        <ModelCard 
                            name={translate('ذكي بلس برو', 'Dhaki Plus Pro')}
                            description={translate(
                                'نموذج متقدم يوفر إجابات أكثر دقة وتفصيلاً للاستفسارات المعقدة',
                                'Advanced model providing more detailed and accurate answers for complex queries'
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 bg-neutral-100 dark:bg-neutral-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
                        {translate('جاهز لتجربة ذكي؟', 'Ready to try Dhaki?')}
                    </h2>
                    <p className="max-w-3xl mx-auto text-lg text-neutral-600 dark:text-neutral-300 mb-8">
                        {translate(
                            'ابدأ استخدام ذكي الآن واستفد من قوة الذكاء الاصطناعي في بحثك',
                            'Start using Dhaki now and leverage the power of AI in your search'
                        )}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button 
                            onClick={() => router.push('/')}
                            size="lg"
                            className={`px-8 py-3 rounded-full text-lg ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}
                        >
                            {translate('ابدأ البحث', 'Start Searching')}
                        </Button>
                    </div>
                    
                    <div className="mt-16">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {translate(
                                '© ذكي 2023-2024. جميع الحقوق محفوظة.',
                                '© Dhaki 2023-2024. All rights reserved.'
                            )}
                        </p>
                        <div className="mt-4 flex justify-center gap-4">
                            <Link href="https://twitter.com/nuqtah_ai" target="_blank" className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="https://github.com/nuqtah/lory" target="_blank" className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                                <Github className="h-5 w-5" />
                            </Link>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <NextImage
                                src="/nuqtalogo.webp"
                                alt="Nuqtah"
                                width={120}
                                height={40}
                                className="h-10 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    const { language } = useLanguage();
    
    return (
        <motion.div 
            variants={item}
            className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                {icon}
            </div>
            <h3 className={`text-xl font-bold text-neutral-900 dark:text-white mb-2 text-center ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}>{title}</h3>
            <p className={`text-neutral-600 dark:text-neutral-300 text-center ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}>{description}</p>
        </motion.div>
    );
}

function ModelCard({ name, description }: { name: string, description: string }) {
    const { language } = useLanguage();
    
    return (
        <div className="bg-neutral-50 dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <h3 className={`text-xl font-bold text-neutral-900 dark:text-white mb-3 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}>{name}</h3>
            <p className={`text-neutral-600 dark:text-neutral-300 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}>{description}</p>
            <div className="mt-4 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className={`text-sm text-neutral-500 dark:text-neutral-400 ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}>
                    {language === 'ar' ? 'متاح للاستخدام' : 'Available now'}
                </span>
            </div>
        </div>
    );
} 