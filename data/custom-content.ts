/**
 * Custom content for the application
 * This file can be edited to add or modify content without changing the core application code
 */

export const customContent = {
  // Custom prompts for the AI
  prompts: {
    // The system prompt for the AI
    system: {
      ar: `أنت محرك بحث ذكي يدعى "ذكي" ومهمتك هي تقديم إجابات دقيقة ومفيدة على أسئلة المستخدم.
يجب أن تكون إجاباتك:
1. دقيقة ومبنية على حقائق
2. موجزة وواضحة
3. مناسبة ثقافيًا للمنطقة العربية
4. مكتوبة بلغة احترافية وسهلة الفهم
5. تحافظ على نفس لغة سؤال المستخدم (إذا سأل بالعربية، أجب بالعربية، وإذا سأل بالإنجليزية، أجب بالإنجليزية)

استخدم الأدوات المتاحة لك للبحث عن المعلومات عندما تحتاج إلى ذلك.`,
      en: `You are an intelligent search engine called "Dhaki" and your task is to provide accurate and helpful answers to user questions.
Your answers should be:
1. Accurate and fact-based
2. Concise and clear
3. Culturally appropriate for the Arab region
4. Written in professional and easy-to-understand language
5. Maintain the same language as the user's question (if asked in Arabic, answer in Arabic, and if asked in English, answer in English)

Use the tools available to you to search for information when needed.`
    },
    
    // Prompts for when the user has reached their limit
    limitReached: {
      ar: "لقد وصلت إلى الحد الأقصى من الأسئلة المسموح بها. يرجى تسجيل الدخول أو إنشاء حساب للاستمرار.",
      en: "You've reached the maximum number of questions allowed. Please sign in or create an account to continue."
    }
  },
  
  // Custom messages
  messages: {
    // Message shown when user has limited questions remaining
    limitWarning: {
      ar: "تبقى لديك {count} أسئلة فقط من إجمالي 25 سؤال. سيتم تجديد رصيدك بعد {days} أيام.",
      en: "You have only {count} questions left out of 25 questions. Your balance will be renewed after {days} days."
    },
    
    // Authentication messages
    auth: {
      loginRequired: {
        ar: "يرجى تسجيل الدخول للاستمرار",
        en: "Please sign in to continue"
      },
      welcomeBack: {
        ar: "مرحبًا بعودتك {name}!",
        en: "Welcome back, {name}!"
      }
    }
  },
  
  // Custom questions data
  sampleQuestions: {
    ar: [
      "ما هي أفضل الأماكن السياحية في المملكة العربية السعودية؟",
      "كيف يمكنني تعلم البرمجة بسرعة؟",
      "ما هي فوائد زيت الزيتون؟",
      "اشرح لي نظرية النسبية بطريقة مبسطة",
      "ما هي أحدث التقنيات في مجال الذكاء الاصطناعي؟"
    ],
    en: [
      "What are the best tourist places in Saudi Arabia?",
      "How can I learn programming quickly?",
      "What are the benefits of olive oil?",
      "Explain Einstein's theory of relativity in simple terms",
      "What are the latest technologies in artificial intelligence?"
    ]
  }
}; 