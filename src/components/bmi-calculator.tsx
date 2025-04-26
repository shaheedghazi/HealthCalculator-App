
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { BmiFormData } from "@/lib/validators";
import { bmiSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Scale } from "lucide-react";

interface BmiCalculatorProps {
  onCalculate: (result: number, data: BmiFormData) => void;
}

export function BmiCalculator({ onCalculate }: BmiCalculatorProps) {
  const [result, setResult] = React.useState<number | null>(null);
  const [unit, setUnit] = React.useState<'metric' | 'imperial'>('metric');

  const form = useForm<BmiFormData>({
    resolver: zodResolver(bmiSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
      unit: 'metric',
    },
  });

   const onSubmit = (data: BmiFormData) => {
    let height = data.height;
    let weight = data.weight;

    // Convert to metric (meters and kg) for calculation
    if (data.unit === 'imperial') {
      height = height * 0.0254; // inches to meters
      weight = weight * 0.453592; // lbs to kg
    } else {
       height = height / 100; // cm to meters
    }

    if (height > 0 && weight > 0) {
      const bmi = weight / (height * height);
      const roundedBmi = Math.round(bmi * 10) / 10; // Round to one decimal place
      setResult(roundedBmi);
      onCalculate(roundedBmi, data); // Pass the original form data (with original units)
    }
  };


  const handleUnitChange = (value: 'metric' | 'imperial') => {
    setUnit(value);
    form.setValue('unit', value);
    // Reset form fields when unit changes
    form.reset({ height: undefined, weight: undefined, unit: value });
    setResult(null);
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">BMI Calculator</CardTitle>
         <Scale className="h-5 w-5 text-muted-foreground" />
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
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder={`Enter height`} {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder={`Enter weight`} {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Calculate BMI
            </Button>
          </form>
        </Form>

        {result !== null && (
          <div className="mt-6 p-4 bg-secondary rounded-md text-center shadow-inner">
            <Label className="text-sm font-medium text-secondary-foreground">Your BMI:</Label>
            <p className="text-3xl font-bold text-primary">{result}</p>
            <p className="text-sm text-muted-foreground mt-1">{getBmiCategory(result)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi >= 18.5 && bmi < 25) return "Normal weight";
  if (bmi >= 25 && bmi < 30) return "Overweight";
  return "Obese";
}


    