import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/language-context';

export function ChatInput({
  // ... existing props ...
}) {
  // ... existing state ...
  const router = useRouter();
  const { translate } = useLanguage();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input) return;
    
    const inputValue = input;
    setInput('');
    
    try {
      // ... existing code ...
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          prompt: inputValue,
          messages: messages,
          selectedTemplate: searchGroupId,
        }),
      });
      
      if (!response.ok) {
        // Check for limit reached error
        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.error === 'Limit reached') {
            toast({
              title: translate('تم تجاوز الحد', 'Limit Reached'),
              description: translate(
                'لقد وصلت إلى الحد الأقصى للأسئلة. يرجى تسجيل الدخول للاستمرار.',
                'You have reached your question limit. Please sign in to continue.'
              ),
              variant: 'destructive',
            });
            
            // Redirect to login page after a short delay
            setTimeout(() => {
              router.push('/login');
            }, 2000);
            
            return;
          }
        }
        throw new Error(`Failed to chat: ${response.statusText}`);
      }
      
      // ... existing streaming code ...
    } catch (error) {
      // ... existing code ...
    }
  };
  
  // ... existing code ...
} 