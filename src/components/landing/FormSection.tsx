import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { CalendarIcon } from 'lucide-react';

const siganOptions = [
  { value: '자시', label: '자시 (23:00~01:00)' },
  { value: '축시', label: '축시 (01:00~03:00)' },
  { value: '인시', label: '인시 (03:00~05:00)' },
  { value: '묘시', label: '묘시 (05:00~07:00)' },
  { value: '진시', label: '진시 (07:00~09:00)' },
  { value: '사시', label: '사시 (09:00~11:00)' },
  { value: '오시', label: '오시 (11:00~13:00)' },
  { value: '미시', label: '미시 (13:00~15:00)' },
  { value: '신시', label: '신시 (15:00~17:00)' },
  { value: '유시', label: '유시 (17:00~19:00)' },
  { value: '술시', label: '술시 (19:00~21:00)' },
  { value: '해시', label: '해시 (21:00~23:00)' },
];

const formSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해주세요.').max(50),
  gender: z.enum(['M', 'F'], { required_error: '성별을 선택해주세요.' }),
  calendarType: z.enum(['solar', 'lunar']),
  isLeapMonth: z.boolean(),
  birthDate: z.date({ required_error: '생년월일을 선택해주세요.' }),
  birthTime: z.string().optional(),
  birthTimeUnknown: z.boolean(),
  question: z.string().trim().min(1, '상담 질문을 입력해주세요.').max(2000),
  packageId: z.string({ required_error: '패키지를 선택해주세요.' }).min(1, '패키지를 선택해주세요.'),
});

type FormValues = z.infer<typeof formSchema>;

const FormSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [upsellText, setUpsellText] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      calendarType: 'solar',
      isLeapMonth: false,
      birthTimeUnknown: false,
      question: '',
      packageId: '',
    },
  });

  const calendarType = form.watch('calendarType');
  const birthTimeUnknown = form.watch('birthTimeUnknown');
  const selectedPackageId = form.watch('packageId');

  const { data: packages } = useQuery({
    queryKey: ['packages-form'],
    queryFn: async () => {
      const { data } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      return data ?? [];
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('consultations').insert({
        name: values.name,
        gender: values.gender,
        calendar_type: values.calendarType,
        is_leap_month: values.isLeapMonth,
        birth_date: format(values.birthDate, 'yyyy-MM-dd'),
        birth_time: values.birthTimeUnknown ? null : (values.birthTime || null),
        birth_time_unknown: values.birthTimeUnknown,
        question: values.question,
        package_id: values.packageId,
      });

      if (error) throw error;

      // Fetch upsell data
      const [settingsRes, linkRes] = await Promise.all([
        supabase.from('site_settings').select('upsell_text').limit(1).single(),
        supabase.from('payment_links').select('url').eq('package_id', values.packageId).limit(1).single(),
      ]);

      setUpsellText(settingsRes.data?.upsell_text || '');
      setPaymentUrl(linkRes.data?.url || null);
      setUpsellOpen(true);

      toast.success('신청이 완료됐습니다!');
      form.reset();
    } catch {
      toast.error('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="form-section" className="py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          상담 신청
        </h2>
        <p className="text-muted-foreground text-center mb-12">
          아래 양식을 작성해 주시면 빠르게 상담을 진행해 드리겠습니다.
        </p>

        <div className="p-6 md:p-8 rounded-xl bg-card border border-border" style={{ boxShadow: 'var(--shadow-glow)' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 이름 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 성별 */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성별</FormLabel>
                    <FormControl>
                      <div className="flex gap-3">
                        {[
                          { value: 'M' as const, label: '남' },
                          { value: 'F' as const, label: '여' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.onChange(opt.value)}
                            className={cn(
                              'flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200',
                              field.value === opt.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border text-foreground hover:border-primary/50'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 생년월일 */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="calendarType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>생년월일</FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          {[
                            { value: 'solar' as const, label: '양력' },
                            { value: 'lunar' as const, label: '음력' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => field.onChange(opt.value)}
                              className={cn(
                                'px-5 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
                                field.value === opt.value
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background border-border text-foreground hover:border-primary/50'
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, 'yyyy년 M월 d일', { locale: ko })
                                : '날짜를 선택해주세요'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 윤달 - 음력일 때만 표시 */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    calendarType === 'lunar' ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <FormField
                    control={form.control}
                    name="isLeapMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-3">
                            {[
                              { value: false, label: '평달' },
                              { value: true, label: '윤달' },
                            ].map((opt) => (
                              <button
                                key={String(opt.value)}
                                type="button"
                                onClick={() => field.onChange(opt.value)}
                                className={cn(
                                  'px-5 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
                                  field.value === opt.value
                                    ? 'bg-accent text-accent-foreground border-accent'
                                    : 'bg-background border-border text-foreground hover:border-accent/50'
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 태어난 시간 */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="birthTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>태어난 시간</FormLabel>
                      <div className="flex gap-3 items-start">
                        <div className="flex-1">
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            disabled={birthTimeUnknown}
                          >
                            <FormControl>
                              <SelectTrigger className={cn(birthTimeUnknown && 'opacity-50')}>
                                <SelectValue placeholder="시간을 선택해주세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {siganOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormField
                          control={form.control}
                          name="birthTimeUnknown"
                          render={({ field: checkField }) => (
                            <label className="flex items-center gap-2 pt-2.5 cursor-pointer whitespace-nowrap text-sm">
                              <Checkbox
                                checked={checkField.value}
                                onCheckedChange={(checked) => {
                                  checkField.onChange(checked);
                                  if (checked) form.setValue('birthTime', '');
                                }}
                              />
                              시간 모름
                            </label>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 질문 */}
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상담받고 싶은 구체적인 질문</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="궁금하신 점을 자세히 적어주세요..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 패키지 선택 */}
              <FormField
                control={form.control}
                name="packageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>패키지 선택</FormLabel>
                    <FormControl>
                      <div className="grid gap-3">
                        {packages?.map((pkg) => (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => field.onChange(pkg.id)}
                            className={cn(
                              'p-4 rounded-lg border text-left transition-all duration-200',
                              field.value === pkg.id
                                ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                                : 'border-border bg-background hover:border-primary/30'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{pkg.name}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">{pkg.description}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-lg whitespace-nowrap">
                                  {pkg.price.toLocaleString()}원
                                </span>
                                <div className={cn(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                                  field.value === pkg.id
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground/30'
                                )}>
                                  {field.value === pkg.id && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 제출 */}
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    신청 중...
                  </>
                ) : (
                  '상담 신청하기'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* 업셀 모달 */}
      <Dialog open={upsellOpen} onOpenChange={setUpsellOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">신청이 완료되었습니다! ✨</DialogTitle>
            {upsellText && (
              <DialogDescription className="text-base pt-2 whitespace-pre-line">
                {upsellText}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            {paymentUrl && (
              <Button asChild className="w-full h-11">
                <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                  결제하기
                </a>
              </Button>
            )}
            <Button variant="ghost" onClick={() => setUpsellOpen(false)} className="w-full">
              괜찮아요
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FormSection;
