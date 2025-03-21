import fs from 'fs';
import path from 'path';

/**
 * Interface for College Info
 */
export interface CollegeInfo {
  name: {
    ar: string;
    en: string;
  };
  location: {
    city: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    [key: string]: any;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    [key: string]: any;
  };
  about: {
    brief: string;
    vision: string;
    mission: string;
    [key: string]: any;
  };
  programs: {
    foundation: any;
    undergraduate: any[];
    postgraduate: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Interface for Tuition Fees
 */
export interface TuitionFees {
  undergraduate: {
    [program: string]: {
      description: string;
      fees_per_year: number;
      currency: string;
      duration: string;
      [key: string]: any;
    };
  };
  postgraduate: {
    [program: string]: {
      description: string;
      fees_total: number;
      currency: string;
      duration: string;
      [key: string]: any;
    };
  };
  additional_fees: {
    [fee: string]: {
      description: string;
      amount: number;
      currency: string;
      [key: string]: any;
    };
  };
  scholarships: {
    [scholarship: string]: {
      description: string;
      discount: string;
      eligibility: string;
      [key: string]: any;
    };
  };
  [key: string]: any;
}

/**
 * Interface for FAQ questions and answers
 */
export interface FAQ {
  question: string;
  answer: string;
}

/**
 * Interface for Common Questions
 */
export interface CommonQuestions {
  general: FAQ[];
  middle_east_college: FAQ[];
  sohar_university: FAQ[];
  career_guidance: FAQ[];
  admission: FAQ[];
  [key: string]: FAQ[];
}

/**
 * Load college general information
 * @param collegeName The name of the college (folder name)
 * @returns The college information
 */
export function getCollegeInfo(collegeName: string): CollegeInfo | null {
  try {
    const filePath = path.join(process.cwd(), 'data', collegeName, 'general-info.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as CollegeInfo;
  } catch (error) {
    console.error(`Error loading college info for ${collegeName}:`, error);
    return null;
  }
}

/**
 * Load college tuition fees
 * @param collegeName The name of the college (folder name)
 * @returns The tuition fees information
 */
export function getTuitionFees(collegeName: string): TuitionFees | null {
  try {
    const filePath = path.join(process.cwd(), 'data', collegeName, 'tuition-fees.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as TuitionFees;
  } catch (error) {
    console.error(`Error loading tuition fees for ${collegeName}:`, error);
    return null;
  }
}

/**
 * Load common questions
 * @returns The common questions data
 */
export function getCommonQuestions(): CommonQuestions | null {
  try {
    const filePath = path.join(process.cwd(), 'data', 'common-questions.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as CommonQuestions;
  } catch (error) {
    console.error('Error loading common questions:', error);
    return null;
  }
}

/**
 * Search for answers in college data based on a query
 * @param query The search query
 * @returns Array of relevant answers
 */
export function searchCollegeData(query: string): { question: string; answer: string; source: string }[] {
  const results: { question: string; answer: string; source: string }[] = [];
  
  // Normalize the query for searching
  const normalizedQuery = query.toLowerCase().trim();
  
  try {
    // Load common questions
    const commonQuestions = getCommonQuestions();
    if (commonQuestions) {
      // Search in all categories
      Object.entries(commonQuestions).forEach(([category, questions]) => {
        questions.forEach(qa => {
          if (
            qa.question.toLowerCase().includes(normalizedQuery) || 
            qa.answer.toLowerCase().includes(normalizedQuery)
          ) {
            results.push({
              question: qa.question,
              answer: qa.answer,
              source: getCategoryDisplayName(category)
            });
          }
        });
      });
    }
    
    // College specific search - Middle East College
    if (
      normalizedQuery.includes('شرق') || 
      normalizedQuery.includes('middle east') || 
      normalizedQuery.includes('mec')
    ) {
      const mecInfo = getCollegeInfo('middle-east-college');
      const mecFees = getTuitionFees('middle-east-college');
      
      if (mecInfo && (normalizedQuery.includes('معلومات') || normalizedQuery.includes('info'))) {
        results.push({
          question: 'ما هي كلية الشرق الأوسط؟',
          answer: mecInfo.about.brief,
          source: 'كلية الشرق الأوسط - معلومات عامة'
        });
      }
      
      if (mecFees && (
        normalizedQuery.includes('تكلفة') || 
        normalizedQuery.includes('رسوم') || 
        normalizedQuery.includes('fees') || 
        normalizedQuery.includes('cost')
      )) {
        // Add undergraduate programs fees
        Object.values(mecFees.undergraduate).forEach(program => {
          results.push({
            question: `ما هي تكلفة دراسة ${program.description} في كلية الشرق الأوسط؟`,
            answer: `تكلفة دراسة ${program.description} في كلية الشرق الأوسط هي ${program.fees_per_year} ${program.currency} سنوياً، لمدة ${program.duration}. ${program.notes || ''}`,
            source: 'كلية الشرق الأوسط - الرسوم الدراسية'
          });
        });
      }
    }
    
    // College specific search - Sohar University
    if (
      normalizedQuery.includes('صحار') || 
      normalizedQuery.includes('sohar')
    ) {
      const soharInfo = getCollegeInfo('sohar-university');
      const soharFees = getTuitionFees('sohar-university');
      
      if (soharInfo && (normalizedQuery.includes('معلومات') || normalizedQuery.includes('info'))) {
        results.push({
          question: 'ما هي جامعة صحار؟',
          answer: soharInfo.about.brief,
          source: 'جامعة صحار - معلومات عامة'
        });
      }
      
      if (soharFees && (
        normalizedQuery.includes('تكلفة') || 
        normalizedQuery.includes('رسوم') || 
        normalizedQuery.includes('fees') || 
        normalizedQuery.includes('cost')
      )) {
        // Add undergraduate programs fees
        Object.values(soharFees.undergraduate).forEach(program => {
          results.push({
            question: `ما هي تكلفة دراسة ${program.description} في جامعة صحار؟`,
            answer: `تكلفة دراسة ${program.description} في جامعة صحار هي ${program.fees_per_year} ${program.currency} سنوياً، لمدة ${program.duration}. ${program.notes || ''}`,
            source: 'جامعة صحار - الرسوم الدراسية'
          });
        });
      }
    }
    
    // Sort results by relevance - give priority to exact matches in question
    results.sort((a, b) => {
      const aQuestionMatch = a.question.toLowerCase().includes(normalizedQuery) ? 1 : 0;
      const bQuestionMatch = b.question.toLowerCase().includes(normalizedQuery) ? 1 : 0;
      
      if (aQuestionMatch !== bQuestionMatch) {
        return bQuestionMatch - aQuestionMatch; // Higher priority for question matches
      }
      
      // If both match in the same way, prioritize shorter answers as they're likely more specific
      return a.answer.length - b.answer.length;
    });
    
    // Return only the top results to avoid overwhelming the user
    return results.slice(0, 5);
    
  } catch (error) {
    console.error('Error searching college data:', error);
    return [];
  }
}

/**
 * Get display name for categories
 */
function getCategoryDisplayName(category: string): string {
  switch (category) {
    case 'general':
      return 'معلومات عامة';
    case 'middle_east_college':
      return 'كلية الشرق الأوسط';
    case 'sohar_university':
      return 'جامعة صحار';
    case 'career_guidance':
      return 'التوجيه المهني';
    case 'admission':
      return 'القبول والتسجيل';
    default:
      return category;
  }
}

/**
 * Get suggested questions based on user's history or popular questions
 * @returns Array of suggested questions
 */
export function getSuggestedQuestions(): string[] {
  return [
    'ما هي تكلفة الدراسة في كلية الشرق الأوسط؟',
    'ما هي التخصصات المتاحة في جامعة صحار؟',
    'هل شهادات كلية الشرق الأوسط معترف بها دولياً؟',
    'ما هي المنح الدراسية المتاحة؟',
    'كيف أختار التخصص المناسب لي؟'
  ];
}

/**
 * Extracts answers from college data for AI prompting
 * This is used to provide information for the AI to answer questions
 * @returns String of college data for AI context
 */
export function getCollegeDataForAI(): string {
  let context = '';
  
  try {
    // Add Middle East College data
    const mecInfo = getCollegeInfo('middle-east-college');
    const mecFees = getTuitionFees('middle-east-college');
    
    if (mecInfo) {
      context += `### معلومات كلية الشرق الأوسط ###\n`;
      context += `${mecInfo.about.brief}\n\n`;
      context += `الرؤية: ${mecInfo.about.vision}\n`;
      context += `الرسالة: ${mecInfo.about.mission}\n\n`;
      
      // Add programs info
      context += `البرامج الدراسية:\n`;
      context += `- البرنامج التأسيسي: ${mecInfo.programs.foundation.description} (${mecInfo.programs.foundation.duration})\n`;
      mecInfo.programs.undergraduate.forEach((program) => {
        context += `- ${program.name} (${program.duration}): تخصصات: ${program.specializations.join(', ')}\n`;
      });
      context += `\n`;
    }
    
    if (mecFees) {
      context += `### رسوم كلية الشرق الأوسط ###\n`;
      // Add fees for undergraduate programs
      Object.entries(mecFees.undergraduate).forEach(([key, program]) => {
        context += `- ${program.description}: ${program.fees_per_year} ${program.currency} سنوياً، المدة: ${program.duration}\n`;
      });
      
      // Add fees for postgraduate programs
      Object.entries(mecFees.postgraduate).forEach(([key, program]) => {
        context += `- ${program.description}: ${program.fees_total} ${program.currency} إجمالي، المدة: ${program.duration}\n`;
      });
      
      // Add scholarships
      context += `\nالمنح الدراسية:\n`;
      Object.entries(mecFees.scholarships).forEach(([key, scholarship]) => {
        context += `- ${scholarship.description}: خصم ${scholarship.discount}، الشروط: ${scholarship.eligibility}\n`;
      });
      context += `\n`;
    }
    
    // Add Sohar University data
    const soharInfo = getCollegeInfo('sohar-university');
    const soharFees = getTuitionFees('sohar-university');
    
    if (soharInfo) {
      context += `### معلومات جامعة صحار ###\n`;
      context += `${soharInfo.about.brief}\n\n`;
      context += `الرؤية: ${soharInfo.about.vision}\n`;
      context += `الرسالة: ${soharInfo.about.mission}\n\n`;
      
      // Add faculties info
      context += `الكليات:\n`;
      soharInfo.faculties.forEach((faculty) => {
        context += `- ${faculty.name}: ${faculty.programs.join(', ')}\n`;
      });
      context += `\n`;
    }
    
    if (soharFees) {
      context += `### رسوم جامعة صحار ###\n`;
      // Add fees for undergraduate programs
      Object.entries(soharFees.undergraduate).forEach(([key, program]) => {
        context += `- ${program.description}: ${program.fees_per_year} ${program.currency} سنوياً، المدة: ${program.duration}\n`;
      });
      
      // Add fees for postgraduate programs
      Object.entries(soharFees.postgraduate).forEach(([key, program]) => {
        context += `- ${program.description}: ${program.fees_total} ${program.currency} إجمالي، المدة: ${program.duration}\n`;
      });
      
      // Add scholarships
      context += `\nالمنح الدراسية:\n`;
      Object.entries(soharFees.scholarships).forEach(([key, scholarship]) => {
        context += `- ${scholarship.description}: خصم ${scholarship.discount}، الشروط: ${scholarship.eligibility}\n`;
      });
      context += `\n`;
    }
    
    // Add common questions for the most asked ones
    const commonQuestions = getCommonQuestions();
    if (commonQuestions) {
      context += `### الأسئلة الشائعة ###\n`;
      
      // Add Middle East College FAQs
      commonQuestions.middle_east_college.forEach(qa => {
        context += `س: ${qa.question}\n`;
        context += `ج: ${qa.answer}\n\n`;
      });
      
      // Add Sohar University FAQs
      commonQuestions.sohar_university.forEach(qa => {
        context += `س: ${qa.question}\n`;
        context += `ج: ${qa.answer}\n\n`;
      });
    }
    
    return context;
    
  } catch (error) {
    console.error('Error preparing college data for AI:', error);
    return 'عذراً، حدث خطأ في تحضير البيانات.';
  }
} 