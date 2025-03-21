import { SearchGroupId } from "@/lib/search-groups";

// Interface for suggested question
export interface SuggestedQuestion {
  id: string;
  text: {
    ar: string;
    en: string;
  };
  group?: SearchGroupId; // Optional: can filter questions by search group
}

// Array of suggested questions
export const suggestedQuestions: SuggestedQuestion[] = [
  {
    id: "q1",
    text: {
      ar: "ما هي الذكاء الاصطناعي وكيف يعمل؟",
      en: "What is artificial intelligence and how does it work?"
    }
  },
  {
    id: "q2",
    text: {
      ar: "اشرح لي الفرق بين الخوارزميات المختلفة للتعلم الآلي",
      en: "Explain the difference between various machine learning algorithms"
    }
  },
  {
    id: "q3",
    text: {
      ar: "كيف أبدأ في تعلم البرمجة؟",
      en: "How do I start learning programming?"
    }
  },
  {
    id: "q4",
    text: {
      ar: "ما هي أفضل الممارسات لتأمين موقع الويب؟",
      en: "What are best practices for securing a website?"
    }
  },
  {
    id: "q5",
    text: {
      ar: "كيف يمكنني تحسين أداء موقعي على محركات البحث؟",
      en: "How can I improve my website's search engine performance?"
    }
  },
  {
    id: "q6",
    text: {
      ar: "ما هي تقنية بلوكتشين وكيف تعمل؟",
      en: "What is blockchain technology and how does it work?"
    }
  }
];

// Function to get questions filtered by group if specified
export const getQuestionsByGroup = (group?: SearchGroupId): SuggestedQuestion[] => {
  if (!group) return suggestedQuestions;
  return suggestedQuestions.filter(q => !q.group || q.group === group);
};

// Function to get random questions from the list
export const getRandomQuestions = (count: number = 3, group?: SearchGroupId): SuggestedQuestion[] => {
  const filtered = getQuestionsByGroup(group);
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}; 