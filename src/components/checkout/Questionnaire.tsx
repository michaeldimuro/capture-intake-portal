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
  const [isFormValid, setIsFormValid] = useState(false);
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

  // Check if all required questions are answered
  useEffect(() => {
    const checkFormValidity = () => {
      const unansweredRequired = visibleQuestions.filter(q => 
        !q.isOptional && !answers[q.partnerQuestionnaireQuestionId]
      );
      
      setIsFormValid(unansweredRequired.length === 0 && visibleQuestions.length > 0);
    };
    
    checkFormValidity();
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
    
    // Check form validity immediately after answer changes
    const unansweredRequired = visibleQuestions.filter(q => 
      !q.isOptional && !(value === '' ? false : value) && q.partnerQuestionnaireQuestionId === questionId
    );
    
    if (unansweredRequired.length > 0) {
      setIsFormValid(false);
    } else {
      // Check all required questions
      const allRequiredAnswered = visibleQuestions.every(q => 
        q.isOptional || answers[q.partnerQuestionnaireQuestionId]
      );
      setIsFormValid(allRequiredAnswered);
    }
    
    // Scroll to the next question after a short delay
    setTimeout(() => {
      const nextQuestion = document.querySelector(`[data-question-id="${questionId}"]`)?.nextElementSibling;
      if (nextQuestion) {
        nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  // Handle "None of the above" logic for multiple choice questions
  const handleMultipleOptionChange = (questionId: string, option: string, checked: boolean, options: any[]) => {
    const currentAnswers = answers[questionId] || [];
    let newAnswers: string[] = [];
    
    // Check if this option is "None of the above" (usually the last option or contains specific text)
    const isNoneOption = option.toLowerCase().includes('none') || 
                         option.toLowerCase().includes('none of the above') ||
                         options.findIndex(opt => opt.option === option) === options.length - 1;
    
    if (isNoneOption) {
      // If "None of the above" is being checked, clear all other selections
      newAnswers = checked ? [option] : [];
    } else {
      if (checked) {
        // If a regular option is being checked, add it and remove any "None of the above" option
        newAnswers = [...currentAnswers.filter((a: any) => 
          !a.toLowerCase().includes('none') && 
          !a.toLowerCase().includes('none of the above') &&
          options.findIndex(opt => opt.option === a) !== options.length - 1
        ), option];
      } else {
        // If a regular option is being unchecked, just remove it
        newAnswers = currentAnswers.filter((a: any) => a !== option);
      }
    }
    
    handleAnswer(questionId, newAnswers);
    form.setValue(questionId, newAnswers);
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
    const isAnswered = !!answers[question.partnerQuestionnaireQuestionId];
    const isRequired = !question.isOptional;
    
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
                <FormLabel className="text-lg font-semibold">
                  {question.title}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
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
                <FormLabel className="text-lg font-semibold">
                  {question.title}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                {question.description && (
                  <FormDescription 
                    dangerouslySetInnerHTML={{ __html: question.description }}
                  />
                )}
                <div className="space-y-2">
                  {question.options.map((option) => {
                    const currentAnswers = answers[question.partnerQuestionnaireQuestionId] || [];
                    const isSelected = currentAnswers.includes(option.option);
                    
                    // Check if this is a "None of the above" option
                    const isNoneOption = option.option.toLowerCase().includes('none') || 
                                         option.title.toLowerCase().includes('none of the above') ||
                                         question.options.findIndex(opt => opt.option === option.option) === question.options.length - 1;
                    
                    return (
                      <FormItem
                        key={option.partnerQuestionnaireQuestionOptionId}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              handleMultipleOptionChange(
                                question.partnerQuestionnaireQuestionId, 
                                option.option, 
                                !!checked,
                                question.options
                              );
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
                <FormLabel className="text-lg font-semibold">
                  {question.title}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
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
          disabled={!isFormValid || visibleQuestions.length === 0}
        >
          Submit Questionnaire
        </Button>
      </CardFooter>
    </Card>
  );
}