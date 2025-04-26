
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { BodyFatFormData } from "@/lib/validators";
import { bodyFatSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent } from "lucide-react"; // Using Percent icon

interface BodyFatCalculatorProps {
  onCalculate: (result: { bodyFat: number; category: string }, data: BodyFatFormData) => void;
}

export function BodyFatCalculator({ onCalculate }: BodyFatCalculatorProps) {
  const [result, setResult] = React.useState<{ bodyFat: number; category: string } | null>(null);
  const [unit, setUnit] = React.useState<'metric' | 'imperial'>('metric');

  const form = useForm<BodyFatFormData>({
    resolver: zodResolver(bodyFatSchema),
    defaultValues: {
      gender: undefined, // Keep radio group undefined
      height: '', // Initialize with empty string
      neck: '', // Initialize with empty string
      waist: '', // Initialize with empty string
      hip: '', // Initialize with empty string (handled by validation)
      unit: 'metric',
    },
    mode: 'onChange', // Validate on change to show hip requirement dynamically
  });

  const selectedGender = form.watch('gender');

  const onSubmit = (data: BodyFatFormData) => {
    // Zod ensures values are numbers if validation passes
    let height = data.height as number;
    let neck = data.neck as number;
    let waist = data.waist as number;
    let hip = data.hip as number | undefined; // Hip might be undefined if male
    const gender = data.gender!; // Gender is required by schema

    let bodyFat: number;

    // Convert measurements to inches if imperial
    if (data.unit === 'imperial') {
      height *= 2.54; // inches to cm
      neck *= 2.54; // inches to cm
      waist *= 2.54; // inches to cm
      if (hip) hip *= 2.54; // inches to cm
    }

    // Convert measurements from cm to inches for the formula (original formula uses inches)
    const heightIn = height / 2.54;
    const neckIn = neck / 2.54;
    const waistIn = waist / 2.54;
    const hipIn = hip ? hip / 2.54 : undefined;


    // U.S. Navy Body Fat Formula (using natural logarithm - Math.log)
    if (gender === 'male') {
        bodyFat = 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
    } else { // female
        if (!hipIn) {
            // This case should be prevented by Zod validation refine
            console.error("Hip measurement missing for female calculation despite validation.");
            return;
        }
        bodyFat = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
    }

    // Ensure body fat is within a reasonable range (e.g., 2% to 50%)
    bodyFat = Math.max(2, Math.min(50, bodyFat));
    const roundedBf = Math.round(bodyFat * 10) / 10; // Round to one decimal place
    const category = getBodyFatCategory(roundedBf, gender);
    const calculatedResult = { bodyFat: roundedBf, category };

    setResult(calculatedResult);
    onCalculate(calculatedResult, data); // Pass original form data
  };

  const handleUnitChange = (value: 'metric' | 'imperial') => {
    setUnit(value);
    form.setValue('unit', value);
    // Reset measurement fields
    form.reset({
        ...form.getValues(), // Keep gender
        height: '',
        neck: '',
        waist: '',
        hip: '',
        unit: value
    });
    setResult(null);
  };

  // Clear hip value and validation if gender changes to male
  React.useEffect(() => {
    if (selectedGender === 'male') {
      form.setValue('hip', ''); // Clear the value
      form.clearErrors('hip'); // Clear potential validation errors
    }
  }, [selectedGender, form]);


  return (
    <Card className="w-full max-w-md shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Body Fat % Calculator</CardTitle>
        <Percent className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit System</FormLabel>
                    <Select
                       onValueChange={(value: 'metric' | 'imperial') => {
                         field.onChange(value);
                         handleUnitChange(value);
                       }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="metric">Metric (cm)</SelectItem>
                        <SelectItem value="imperial">Imperial (inches)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value} // Control the value
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder={`Enter height`} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="neck"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neck Circumference ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder={`Enter neck circumference`} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="waist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waist Circumference ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder={`Enter waist circumference`} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Hip Input for Females */}
            {selectedGender === 'female' && (
              <FormField
                control={form.control}
                name="hip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hip Circumference ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder={`Enter hip circumference`} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Calculate Body Fat %
            </Button>
          </form>
        </Form>

        {result !== null && (
          <div className="mt-6 p-4 bg-secondary rounded-md text-center shadow-inner">
            <Label className="text-sm font-medium text-secondary-foreground">Estimated Body Fat:</Label>
            <p className="text-3xl font-bold text-primary">{result.bodyFat.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-1">Category: {result.category}</p>
            <p className="text-xs text-muted-foreground mt-2">Note: This is an estimate based on the U.S. Navy method. More accurate methods exist.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Function to determine body fat category based on ACE (American Council on Exercise) guidelines
function getBodyFatCategory(bfPercentage: number, gender: 'male' | 'female'): string {
  if (gender === 'female') {
    if (bfPercentage < 10) return "Critically Underfat";
    if (bfPercentage >= 10 && bfPercentage <= 13) return "Essential Fat";
    if (bfPercentage >= 14 && bfPercentage <= 20) return "Athletes";
    if (bfPercentage >= 21 && bfPercentage <= 24) return "Fitness";
    if (bfPercentage >= 25 && bfPercentage <= 31) return "Acceptable";
    if (bfPercentage > 31) return "Obese";
  } else { // male
    if (bfPercentage < 2) return "Critically Underfat";
    if (bfPercentage >= 2 && bfPercentage <= 5) return "Essential Fat";
    if (bfPercentage >= 6 && bfPercentage <= 13) return "Athletes";
    if (bfPercentage >= 14 && bfPercentage <= 17) return "Fitness";
    if (bfPercentage >= 18 && bfPercentage <= 24) return "Acceptable";
    if (bfPercentage > 24) return "Obese";
  }
  return "Unknown"; // Should not happen
}
