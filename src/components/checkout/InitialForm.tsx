import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product } from '@/lib/types';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, Repeat, Package2 } from 'lucide-react';
import Image from '@/components/ui/image';
import { pluralize } from '@/lib/utils';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const formSchema = z.object({
  // Customer Details
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  birthMonth: z.string().min(1, 'Month is required'),
  birthDay: z.string().min(1, 'Day is required'),
  birthYear: z.string().min(4, 'Year is required'),
  gender: z.string().min(1, 'Please select your gender'),
  
  // Shipping Details
  address1: z.string().min(5, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code required'),
  country: z.string().min(2, 'Country is required'),
}).refine((data) => {
  const today = new Date();
  const birthDate = new Date(
    parseInt(data.birthYear),
    parseInt(data.birthMonth) - 1,
    parseInt(data.birthDay)
  );
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
}, {
  message: "You must be at least 18 years old",
  path: ["birthYear"]
});

interface InitialFormProps {
  product: Product;
  onSubmit: (data: any) => void;
}

export function InitialForm({ product, onSubmit }: InitialFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthMonth: '',
      birthDay: '',
      birthYear: '',
      gender: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
  });

  const handleSubmit = (data: any) => {
    const formattedData = {
      ...data,
      dateOfBirth: `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`,
    };
    
    delete formattedData.birthMonth;
    delete formattedData.birthDay;
    delete formattedData.birthYear;
    
    onSubmit(formattedData);
  };

  // Generate arrays for days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18;
  const years = Array.from(
    { length: 82 },
    (_, i) => (maxYear - i).toString()
  );

  const totalQuantity = (product.quantity || 0) * (product.monthSupply || 1);
  const monthlyPrice = Number(product.price) / (product.monthSupply || 1);
  const monthText = pluralize(product.monthSupply, "month", "months");

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">Complete Your Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Product Details Section */}
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <div className="pb-6 border-b">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted/30">
                  <Image
                    src={product.offeringImageUrl || `https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/swipe3.jpg`}
                    alt={product.offeringName}
                    className="object-cover"
                    fill
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium">{product.offeringName}</h4>
                  <p className="text-muted-foreground mt-2 line-clamp-2 md:line-clamp-none">
                    {product.offeringDescription}
                  </p>
                  {/* <div className="flex flex-wrap items-center gap-2 text-sm border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-4">
                    <span className="font-medium">
                      {product.dosageVariety.dosage}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="capitalize">
                      {product.dosageVariety.form}
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
            <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
              <Pill className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Strength</p>
                <p className="font-medium">
                  {product.dosageVariety.dosage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
              <Package2 className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">
                  {totalQuantity} doses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
              <Repeat className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Supply</p>
                <p className="font-medium">
                  {product.monthSupply} {monthText}
                </p>
              </div>
            </div>
          </div> */}

          <div className="py-4 border-t bg-muted/50 px-4">
            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="font-medium text-base">Quantity per shipment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.monthSupply} {monthText} ×{" "}
                  {product.quantity} doses ×{" "}
                  {product.dosageVariety.dosage}
                </p>
              </div>
              <p className="text-xl font-semibold shrink-0">
                {totalQuantity} units
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="font-medium text-base">Shipping</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Standard Shipping (3-5 days)
                </p>
              </div>
              <div>
              <p className="text-xl font-semibold shrink-0 line-through">
                $10.00
              </p>
              <p className="text-xl font-semibold shrink-0 text-green-600 text-right">
                Free
              </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-base">Subscription Price</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Billed every {product.monthSupply} {monthText}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${Number(product.price).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  (${monthlyPrice.toFixed(2)}/month)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel className="text-base">Date of Birth</FormLabel>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="birthMonth"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDay"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthYear"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Shipping Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Shipping Information</h3>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">City</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">State</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">ZIP Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-12"
                          maxLength={5}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Country</FormLabel>
                      <FormControl>
                        <Input {...field} value="US" disabled className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base">Continue to Payment</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}