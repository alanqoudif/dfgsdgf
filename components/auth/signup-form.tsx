import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/hooks/useLanguage';

// قائمة الجامعات والكليات في عمان
const omanUniversities = [
  {
    name: 'جامعة السلطان قابوس',
    colleges: [
      'كلية الآداب والعلوم الاجتماعية',
      'كلية الاقتصاد والعلوم السياسية',
      'كلية التربية',
      'كلية الحقوق',
      'كلية العلوم',
      'كلية العلوم الزراعية والبحرية',
      'كلية الطب والعلوم الصحية',
      'كلية الهندسة',
    ]
  },
  {
    name: 'جامعة نزوى',
    colleges: [
      'كلية الهندسة والعمارة',
      'كلية العلوم والآداب',
      'كلية الاقتصاد والإدارة ونظم المعلومات',
      'كلية الصيدلة والتمريض',
    ]
  },
  {
    name: 'جامعة ظفار',
    colleges: [
      'كلية التجارة والعلوم الإدارية',
      'كلية الحاسوب وتقنية المعلومات',
      'كلية اللغات والترجمة',
      'كلية الهندسة',
      'كلية العلوم التطبيقية',
    ]
  },
  {
    name: 'جامعة صحار',
    colleges: [
      'كلية إدارة الأعمال',
      'كلية الحوسبة وتقنية المعلومات',
      'كلية الهندسة',
      'كلية التربية والآداب',
      'كلية القانون',
    ]
  },
  {
    name: 'الجامعة العربية المفتوحة',
    colleges: [
      'كلية الدراسات التجارية',
      'كلية تقنية المعلومات',
      'كلية اللغة الإنجليزية',
      'كلية الدراسات التربوية',
    ]
  },
  {
    name: 'الكلية الحديثة للتجارة والعلوم',
    colleges: [
      'قسم إدارة الأعمال',
      'قسم العلوم المالية والمصرفية',
      'قسم نظم المعلومات',
    ]
  },
  {
    name: 'كلية البريمي الجامعية',
    colleges: [
      'قسم الهندسة',
      'قسم إدارة الأعمال',
      'قسم تقنية المعلومات',
    ]
  },
  {
    name: 'كلية مزون',
    colleges: [
      'قسم إدارة الأعمال',
      'قسم تقنية المعلومات',
      'قسم العلوم القانونية',
    ]
  },
  {
    name: 'جامعة الشرقية',
    colleges: [
      'كلية إدارة الأعمال',
      'كلية الهندسة',
      'كلية العلوم والآداب',
    ]
  },
  {
    name: 'أخرى',
    colleges: ['أخرى']
  }
];

// أنواع المستخدمين
const userTypes = [
  { value: 'university_student', label: 'طالب جامعي' },
  { value: 'school_student', label: 'طالب مدرسة' },
  { value: 'employee', label: 'موظف' },
  { value: 'other', label: 'أخرى' }
];

// مخطط التحقق
const signUpSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  userType: z.string(),
  university: z.string().optional(),
  college: z.string().optional(),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const { signUp } = useAuth();
  const { translate, language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [showUniversityFields, setShowUniversityFields] = useState(false);

  // initialize the form
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      userType: '',
      university: '',
      college: '',
    },
  });

  // handle form submission
  async function onSubmit(data: SignUpFormValues) {
    setLoading(true);
    try {
      // إضافة معلومات المستخدم الإضافية
      const userData = {
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            user_type: data.userType,
            university: data.university || null,
            college: data.college || null,
          }
        }
      };
      
      await signUp(userData);
      toast({
        title: translate("تم إنشاء الحساب بنجاح", "Account created successfully"),
        description: translate("تم إرسال رابط تأكيد إلى بريدك الإلكتروني.", "A confirmation link has been sent to your email."),
      });
    } catch (error: any) {
      toast({
        title: translate("خطأ في إنشاء الحساب", "Error creating account"),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  // التحكم في إظهار حقول الجامعة والكلية
  const handleUserTypeChange = (value: string) => {
    form.setValue('userType', value);
    const isUniversityStudent = value === 'university_student';
    setShowUniversityFields(isUniversityStudent);
    
    if (!isUniversityStudent) {
      form.setValue('university', '');
      form.setValue('college', '');
      setSelectedUniversity('');
    }
  };

  // التحكم في تغيير الجامعة
  const handleUniversityChange = (value: string) => {
    form.setValue('university', value);
    setSelectedUniversity(value);
    form.setValue('college', '');
  };

  // الحصول على كليات الجامعة المختارة
  const getColleges = () => {
    const university = omanUniversities.find(uni => uni.name === selectedUniversity);
    return university ? university.colleges : [];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate("الاسم", "Name")}</FormLabel>
              <FormControl>
                <Input placeholder={translate("أدخل اسمك", "Enter your name")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate("البريد الإلكتروني", "Email")}</FormLabel>
              <FormControl>
                <Input placeholder={translate("أدخل بريدك الإلكتروني", "Enter your email")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate("كلمة المرور", "Password")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={translate("******", "******")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate("نوع المستخدم", "User Type")}</FormLabel>
              <Select onValueChange={handleUserTypeChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={translate("اختر نوع المستخدم", "Select user type")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {userTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {language === 'ar' ? type.label : type.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showUniversityFields && (
          <>
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("الجامعة", "University")}</FormLabel>
                  <Select onValueChange={handleUniversityChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={translate("اختر الجامعة", "Select university")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {omanUniversities.map((university) => (
                        <SelectItem key={university.name} value={university.name}>
                          {university.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedUniversity && (
              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("الكلية", "College")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={translate("اختر الكلية", "Select college")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getColleges().map((college) => (
                          <SelectItem key={college} value={college}>
                            {college}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
              {translate("جاري التسجيل...", "Signing up...")}
            </div>
          ) : (
            translate("إنشاء حساب", "Sign Up")
          )}
        </Button>
      </form>
    </Form>
  );
} 