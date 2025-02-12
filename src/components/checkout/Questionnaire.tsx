import { useState, useEffect } from 'react';
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

interface QuestionnaireProps {
  onSubmit: (data: QuestionnaireResponse) => void;
  questions: Question[];
}

export function Questionnaire({ onSubmit, questions }: QuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const form = useForm<QuestionnaireResponse>();

  useEffect(() => {
    if (questions.length > 0) {
      const answeredQuestions = Object.keys(answers).length;
      const visibleQuestions = questions.filter(q => isQuestionVisible(q)).length;
      setProgress((answeredQuestions / visibleQuestions) * 100);
    }
  }, [answers, questions]);

  const currentQuestion = questions[currentQuestionIndex];

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

  const findNextVisibleQuestionIndex = (startIndex: number): number => {
    let nextIndex = startIndex;
    while (nextIndex < questions.length) {
      if (isQuestionVisible(questions[nextIndex])) {
        return nextIndex;
      }
      nextIndex++;
    }
    return -1;
  };

  const findPreviousVisibleQuestionIndex = (startIndex: number): number => {
    let prevIndex = startIndex;
    while (prevIndex >= 0) {
      if (isQuestionVisible(questions[prevIndex])) {
        return prevIndex;
      }
      prevIndex--;
    }
    return -1;
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const nextIndex = findNextVisibleQuestionIndex(currentQuestionIndex + 1);
    if (nextIndex !== -1) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      onSubmit(answers);
    }
  };

  const handleBack = () => {
    const prevIndex = findPreviousVisibleQuestionIndex(currentQuestionIndex - 1);
    if (prevIndex !== -1) {
      setCurrentQuestionIndex(prevIndex);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'singleOption':
        return (
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
                      form.setValue(question.partnerQuestionnaireQuestionId, value);
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
        );

      case 'multipleOption':
        return (
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
        );

      case 'text':
      case 'string':
        return (
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
                      form.setValue(question.partnerQuestionnaireQuestionId, e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
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

  if (!currentQuestion) return null;

  const canProceed = answers[currentQuestion.partnerQuestionnaireQuestionId] !== undefined &&
    (!currentQuestion.isOptional || answers[currentQuestion.partnerQuestionnaireQuestionId] !== '');

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
          <form className="space-y-6">
            {renderQuestion(currentQuestion)}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
        >
          {findNextVisibleQuestionIndex(currentQuestionIndex + 1) === -1 ? 'Submit' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
}