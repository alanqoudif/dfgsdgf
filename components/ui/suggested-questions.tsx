import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { SearchGroupId } from '@/lib/search-groups';
import { SuggestedQuestion, getRandomQuestions } from '@/data/suggestedQuestions';
import { useLanguage } from '@/app/language-context';
import { Lightbulb } from 'lucide-react';

interface SuggestedQuestionsProps {
  selectedGroup: SearchGroupId;
  onQuestionClick: (question: string) => void;
  clearSuggestions: () => void;
  showSuggestions: boolean;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  selectedGroup,
  onQuestionClick,
  clearSuggestions,
  showSuggestions
}) => {
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const { language } = useLanguage();

  useEffect(() => {
    if (showSuggestions) {
      try {
        const newQuestions = getRandomQuestions(4, selectedGroup);
        setQuestions(newQuestions);
      } catch (error) {
        console.error("Error loading suggested questions:", error);
        setQuestions([]);
      }
    } else {
      setQuestions([]);
    }
  }, [selectedGroup, showSuggestions]);

  if (!showSuggestions || questions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 my-4">
      <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Lightbulb className="h-4 w-4" />
        <span>{language === 'ar' ? 'أسئلة مقترحة' : 'Suggested questions'}</span>
      </div>
      <div className="flex flex-wrap gap-2 rtl:justify-end">
        {questions.map((q) => (
          <Button
            key={q.id}
            variant="outline"
            size="sm"
            className={`rounded-full text-xs ${language === 'ar' ? 'font-tajawal' : 'font-montserrat'}`}
            onClick={() => {
              onQuestionClick(q.text[language === 'ar' ? 'ar' : 'en']);
              clearSuggestions();
            }}
          >
            {q.text[language === 'ar' ? 'ar' : 'en']}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions; 