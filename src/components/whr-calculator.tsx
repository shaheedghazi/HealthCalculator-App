
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { WhrFormData } from "@/lib/validators";
import { whrSchema } from "@/lib/validators";
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
import { Ruler } from "lucide-react"; // Using Ruler icon

interface WhrCalculatorProps {
  onCalculate: (result: { ratio: number; risk: string }, data: WhrFormData) => void;
}

export function WhrCalculator({ onCalculate }: WhrCalculatorProps) {
  const [result, setResult] = React.useState<{ ratio: number; risk: string } | null>(null);
  const [unit, setUnit] = React.useState<'metric' | 'imperial'>('metric');

  const form = useForm<WhrFormData>({
    resolver: zodResolver(whrSchema),
    defaultValues: {
      waist: undefined,
      hip: undefined,
      gender: undefined, // Optional for calculation, used for risk assessment
      unit: 'metric',
    },
  });

  const onSubmit = (data: WhrFormData) => {
    const { waist, hip, gender } = data;

    // Ensure units are consistent (calculation works regardless of cm or inches as long as they match)
    if (waist > 0 && hip > 0) {
      const ratio = waist / hip;
      const roundedRatio = Math.round(ratio * 100) / 100; // Round to two decimal places

      let risk = "N/A";
      if (gender) {
          risk = getWhrRiskCategory(roundedRatio, gender);
      } else {
          risk = "Gender not specified for risk assessment";
      }

      const calculatedResult = { ratio: roundedRatio, risk };
      setResult(calculatedResult);
      onCalculate(calculatedResult, data); // Pass original form data
    }
  };

  const handleUnitChange = (value: 'metric' | 'imperial') => {
    setUnit(value);
    form.setValue('unit', value);
    // Reset measurement fields
    form.reset({
        ...form.getValues(), // Keep gender
        waist: undefined,
        hip: undefined,
        unit: value
    });
    setResult(null);
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Waist-to-Hip Ratio (WHR)</CardTitle>
        <Ruler className="h-5 w-5 text-muted-foreground" />
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
              name="waist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waist Circumference ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder={`Enter waist circumference`} {...field} />
                  </FormControl>
                   <FormDescription className="text-xs">Measure at the narrowest point, usually just above the navel.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hip Circumference ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder={`Enter hip circumference`} {...field} />
                  </FormControl>
                   <FormDescription className="text-xs">Measure at the widest part of your hips/buttocks.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Gender (for Risk Assessment)</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                       <FormItem className="flex items-center space-x-3 space-y-0">
                           <FormControl>
                             <RadioGroupItem value={undefined} id="gender-none" />
                           </FormControl>
                          <FormLabel htmlFor="gender-none" className="font-normal">Prefer not to say</FormLabel>
                       </FormItem>
                    </RadioGroup>
                  </FormControl>
                   <FormDescription className="text-xs">Helps determine health risk category based on standard thresholds.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Calculate WHR
            </Button>
          </form>
        </Form>

        {result !== null && (
          <div className="mt-6 p-4 bg-secondary rounded-md text-center shadow-inner">
            <Label className="text-sm font-medium text-secondary-foreground">Waist-to-Hip Ratio:</Label>
            <p className="text-3xl font-bold text-primary">{result.ratio.toFixed(2)}</p>
            <Label className="text-sm font-medium text-secondary-foreground mt-2 block">Health Risk Assessment:</Label>
            <p className={`text-sm font-semibold mt-1 ${result.risk === 'Low Risk' ? 'text-green-600' : result.risk === 'Moderate Risk' ? 'text-yellow-600' : result.risk === 'High Risk' ? 'text-red-600' : 'text-muted-foreground'}`}>
                {result.risk}
            </p>
             <p className="text-xs text-muted-foreground mt-2">WHR is an indicator of fat distribution and potential health risks.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Function to determine health risk based on WHR (WHO guidelines)
function getWhrRiskCategory(whr: number, gender: 'male' | 'female'): string {
  if (gender === 'female') {
    if (whr <= 0.80) return "Low Risk";
    if (whr > 0.80 && whr <= 0.85) return "Moderate Risk";
    if (whr > 0.85) return "High Risk";
  } else { // male
    if (whr <= 0.95) return "Low Risk";
    if (whr > 0.95 && whr <= 1.0) return "Moderate Risk";
    if (whr > 1.0) return "High Risk";
  }
  return "Unable to assess"; // Should not happen with valid inputs
}

    