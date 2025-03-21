import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSession, suggestQuestions } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SearchPanel } from "@/components/SearchPanel";
import { RecentChats } from "@/components/RecentChats";

// إضافة دوال مؤقتة لإصلاح أخطاء الاستيراد
const fetchMetadata = async () => {
  return {
    metadata: {
      title: "مشروع نقطة",
      description: "مساعد ذكي لطلاب الجامعات في عمان"
    }
  };
};

const generateSpeech = async () => {
  return null;
};

const getUserFilesForAI = async () => {
  return [];
};

export default async function LandingPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  const suggestedQuestions = await suggestQuestions("");
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">مرحباً بك في نقطة</h1>
        <p className="text-xl text-muted-foreground mb-6">
          المساعد الذكي لطلاب الجامعات في عمان
        </p>
      </div>
      
      <Card className="w-full max-w-3xl p-6 mb-8">
        <SearchPanel />
      </Card>
      
      <div className="w-full max-w-3xl">
        <h2 className="text-2xl font-semibold mb-4">أسئلة مقترحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {suggestedQuestions.map((question, i) => (
            <Link href={`/chat?q=${encodeURIComponent(question)}`} key={i}>
              <Button variant="outline" className="w-full justify-start text-right">
                {question}
              </Button>
            </Link>
          ))}
        </div>
        
        <RecentChats />
      </div>
    </div>
  );
}