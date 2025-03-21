'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, Trash } from 'lucide-react';

type ChatHistory = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
};

export function RecentChats() {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // في التطبيق الحقيقي، نقوم بجلب المحادثات السابقة من Supabase
    // هنا نستخدم بيانات وهمية للعرض فقط
    const mockChats: ChatHistory[] = [
      {
        id: '1',
        title: 'معلومات عن كلية الشرق الأوسط',
        lastMessage: 'ما هي رسوم كلية الشرق الأوسط؟',
        timestamp: Date.now() - 3600000, // قبل ساعة واحدة
      },
      {
        id: '2',
        title: 'الاستفسار عن جامعة صحار',
        lastMessage: 'ما هي التخصصات المتاحة في جامعة صحار؟',
        timestamp: Date.now() - 86400000, // قبل يوم واحد
      },
    ];
    
    setChats(mockChats);
    setLoading(false);
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-4">جاري تحميل المحادثات السابقة...</div>;
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">لا توجد محادثات سابقة</p>
        <Link href="/chat">
          <Button>بدء محادثة جديدة</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">محادثاتك الأخيرة</h2>
        <Link href="/chat">
          <Button size="sm" variant="outline">
            <MessageCircle className="w-4 h-4 ml-2" />
            محادثة جديدة
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {chats.map((chat) => (
          <Link href={`/chat/${chat.id}`} key={chat.id}>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">{chat.title}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 ml-1" />
                    {formatTime(chat.timestamp)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-muted-foreground line-clamp-1">{chat.lastMessage}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 