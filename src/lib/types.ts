export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  questions: Question[];
  variant: ProductVariant;
}

export interface ProductVariant {
  price: number;
  quantity: number;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingDetails {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  sameAsShipping: boolean;
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingCountry?: string;
}

export interface QuestionnaireResponse {
  [key: string]: string | string[];
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  fontFamily?: string;
}

export interface QuestionOption {
  partnerQuestionnaireQuestionOptionId: string;
  title: string;
  option: string;
  isImportant: boolean;
  isCritical: boolean;
  order: number;
  iconType: string | null;
  icon: string | null;
}

export interface QuestionRule {
  id: string;
  title: string;
  type: string;
  requirements: {
    basedOn: string;
    requiredQuestionId: string;
    requiredQuestionTitle: string;
    conditionalAnswer: string | null;
    requiredAnswer: string;
  }[];
}

export interface Question {
  partnerQuestionnaireQuestionId: string;
  title: string;
  description: string | null;
  label: string | null;
  placeholder: string | null;
  isImportant: boolean;
  isCritical: boolean;
  displayInPdf: boolean;
  isOptional: boolean;
  isVisible: boolean;
  hasNextButton: boolean;
  hasBackButton: boolean;
  order: number;
  type: 'singleOption' | 'multipleOption' | 'text' | 'string' | 'file';
  defaultValue: string | null;
  feedAds: string | null;
  ruleType: string;
  holdStatus: boolean;
  isAdditionalApprovalNeeded: boolean;
  options: QuestionOption[];
  attachments: any[];
  rules: QuestionRule[];
}

export interface Questionnaire {
  id: string;
  name: string;
  description: string;
  questionnaireId: string;
  questions: Question[];
}