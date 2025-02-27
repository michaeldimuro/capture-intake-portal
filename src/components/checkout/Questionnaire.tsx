import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Question, QuestionnaireResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ClipboardList, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuestionnaireProps {
  onSubmit: (data: QuestionnaireResponse) => void;
  questions: Question[];
}

export function Questionnaire({ onSubmit, questions }: QuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);
  const [animatingQuestionIds, setAnimatingQuestionIds] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<QuestionnaireResponse>();

  // Determine which questions should be visible based on current answers
  useEffect(() => {
    const determineVisibleQuestions = () => {
      const newVisibleQuestions: Question[] = [];
      const newAnimatingIds: string[] = [];
      
      questions.forEach(question => {
        const wasVisible = visibleQuestions.some(q => q.partnerQuestionnaireQuestionId === question.partnerQuestionnaireQuestionId);
        const isVisible = isQuestionVisible(question);
        
        if (isVisible) {
          newVisibleQuestions.push(question);
          
          // If this question wasn't visible before but is now, mark it for animation
          if (!wasVisible) {
            newAnimatingIds.push(question.partnerQuestionnaireQuestionId);
          }
        }
      });
      
      setVisibleQuestions(newVisibleQuestions);
      setAnimatingQuestionIds(newAnimatingIds);
      
      // After a short delay, remove the animating class
      if (newAnimatingIds.length > 0) {
        setTimeout(() => {
          setAnimatingQuestionIds([]);
        }, 500);
      }
    };
    
    determineVisibleQuestions();
  }, [answers, questions]);

  // Update progress based on answered questions
  useEffect(() => {
    if (visibleQuestions.length > 0) {
      const answeredQuestions = Object.keys(answers).length;
      setProgress((answeredQuestions / visibleQuestions.length) * 100);
    }
  }, [answers, visibleQuestions]);

  const isQuestionVisible = (question: Question): boolean => {
    if (!question.rules || question.rules.length === 0) return true;

    return question.rules.every((rule) => {
      return rule.requirements.every((req) => {
        const answer = answers[req.requiredQuestionId];
        if (Array.isArray(answer)) {
          return answer.includes(req.requiredAnswer);
        }
        return answer === req.requiredAnswer;
      });
    });
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    
    // Scroll to the next question after a short delay
    setTimeout(() => {
      const nextQuestion = document.querySelector(`[data-question-id="${questionId}"]`)?.nextElementSibling;
      if (nextQuestion) {
        nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const handleSubmit = () => {
    // Check if all required questions are answered
    const unansweredRequired = visibleQuestions.filter(q => 
      !q.isOptional && !answers[q.partnerQuestionnaireQuestionId]
    );
    
    if (unansweredRequired.length > 0) {
      // Scroll to the first unanswered required question
      const firstUnanswered = document.querySelector(`[data-question-id="${unansweredRequired[0].partnerQuestionnaireQuestionId}"]`);
      if (firstUnanswered) {
        firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    onSubmit(answers);
  };

  const renderQuestion = (question: Question) => {
    const isAnimating = animatingQuestionIds.includes(question.partnerQuestionnaireQuestionId);
    
    return (
      <div 
        key={question.partnerQuestionnaireQuestionId}
        data-question-id={question.partnerQuestionnaireQuestionId}
        className={cn(
          "py-6 border-b last:border-b-0 transition-all duration-500",
          isAnimating ? "animate-in fade-in slide-in-from-top-4" : ""
        )}
      >
        {question.type === 'singleOption' && (
          <FormField
            control={form.control}
            name={question.partnerQuestionnaireQuestionId}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-semibold">{question.title}</FormLabel>
                {question.description && (
                  <FormDescription 
                    dangerouslySetInnerHTML={{ __html: question.description }}
                  />
                )}
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      handleAnswer(question.partnerQuestionnaireQuestionId, value);
                      field.onChange(value);
                    }}
                    value={answers[question.partnerQuestionnaireQuestionId] || ''}
                    className="space-y-2"
                  >
                    {question.options.map((option) => {
                      const isSelected = answers[question.partnerQuestionnaireQuestionId] === option.option;
                      return (
                        <FormItem
                          key={option.partnerQuestionnaireQuestionOptionId}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem
                              value={option.option}
                              className={isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}
                            />
                          </FormControl>
                          <FormLabel className={`font-normal ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                            {option.title}
                          </FormLabel>
                        </FormItem>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {question.type === 'multipleOption' && (
          <FormField
            control={form.control}
            name={question.partnerQuestionnaireQuestionId}
            render={() => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-semibold">{question.title}</FormLabel>
                {question.description && (
                  <FormDescription 
                    dangerouslySetInnerHTML={{ __html: question.description }}
                  />
                )}
                <div className="space-y-2">
                  {question.options.map((option) => {
                    const isSelected = answers[question.partnerQuestionnaireQuestionId]?.includes(option.option);
                    return (
                      <FormItem
                        key={option.partnerQuestionnaireQuestionOptionId}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const currentAnswers = answers[question.partnerQuestionnaireQuestionId] || [];
                              const newAnswers = checked
                                ? [...currentAnswers, option.option]
                                : currentAnswers.filter((a: string) => a !== option.option);
                              handleAnswer(question.partnerQuestionnaireQuestionId, newAnswers);
                              form.setValue(question.partnerQuestionnaireQuestionId, newAnswers);
                            }}
                            className={isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}
                          />
                        </FormControl>
                        <FormLabel className={`font-normal ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                          {option.title}
                        </FormLabel>
                      </FormItem>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(question.type === 'text' || question.type === 'string') && (
          <FormField
            control={form.control}
            name={question.partnerQuestionnaireQuestionId}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">{question.title}</FormLabel>
                {question.description && (
                  <FormDescription 
                    dangerouslySetInnerHTML={{ __html: question.description }}
                  />
                )}
                <FormControl>
                  <Textarea
                    {...field}
                    value={answers[question.partnerQuestionnaireQuestionId] || ''}
                    placeholder={question.placeholder || ''}
                    onChange={(e) => {
                      handleAnswer(question.partnerQuestionnaireQuestionId, e.target.value);
                      field.onChange(e.target.value);
                    }}
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Health Questionnaire
        </CardTitle>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form ref={formRef} className="space-y-0">
            {visibleQuestions.length > 0 ? (
              visibleQuestions.map(renderQuestion)
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading questions...</p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={visibleQuestions.length === 0}
        >
          Submit Questionnaire
        </Button>
      </CardFooter>
    </Card>
  );
}