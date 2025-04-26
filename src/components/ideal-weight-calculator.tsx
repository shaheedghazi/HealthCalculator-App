
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { IdealWeightFormData } from "@/lib/validators";
import { idealWeightSchema } from "@/lib/validators";
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
import { Weight } from "lucide-react"; // Using Weight icon

interface IdealWeightCalculatorProps {
  onCalculate: (result: { idealWeightMin: number; idealWeightMax: number; unit: string }, data: IdealWeightFormData) => void;
}

export function IdealWeightCalculator({ onCalculate }: IdealWeightCalculatorProps) {
  const [result, setResult] = React.useState<{ idealWeightMin: number; idealWeightMax: number; unit: string } | null>(null);
  const [unit, setUnit] = React.useState<'metric' | 'imperial'>('metric');

  const form = useForm<IdealWeightFormData>({
    resolver: zodResolver(idealWeightSchema),
    defaultValues: {
      gender: undefined,
      height: undefined,
      unit: 'metric',
    },
  });

  const onSubmit = (data: IdealWeightFormData) => {
    let height = data.height;
    const gender = data.gender;
    const currentUnit = data.unit;

    // Convert height to inches for the formula
    let heightInInches: number;
    if (currentUnit === 'metric') {
      heightInInches = height / 2.54;
    } else {
      heightInInches = height;
    }

    let idealWeightKg: number;
    const heightThresholdInches = 60; // 5 feet

    // Calculate Ideal Body Weight (IBW) using Devine Formula in kg
    if (heightInInches > heightThresholdInches) {
        const heightDifferenceInches = heightInInches - heightThresholdInches;
        if (gender === 'male') {
            idealWeightKg = 50 + (2.3 * heightDifferenceInches);
        } else { // female
            idealWeightKg = 45.5 + (2.3 * heightDifferenceInches);
        }
    } else {
        // For heights at or below 5 feet, some sources adjust differently or state the formula isn't ideal.
        // We'll use a simple approach: the base weight.
        idealWeightKg = (gender === 'male') ? 50 : 45.5;
    }


    // Provide a range (+/- 10% is common, but we can use a simpler approach)
    // Let's use the Hamwi formula range concept loosely for simplicity.
    const idealWeightMinKg = idealWeightKg * 0.9; // -10%
    const idealWeightMaxKg = idealWeightKg * 1.1; // +10%

    let calculatedResult: { idealWeightMin: number; idealWeightMax: number; unit: string };

    if (currentUnit === 'imperial') {
      const kgToLbs = 2.20462;
      calculatedResult = {
        idealWeightMin: Math.round(idealWeightMinKg * kgToLbs * 10) / 10,
        idealWeightMax: Math.round(idealWeightMaxKg * kgToLbs * 10) / 10,
        unit: 'lbs',
      };
    } else {
      calculatedResult = {
        idealWeightMin: Math.round(idealWeightMinKg * 10) / 10,
        idealWeightMax: Math.round(idealWeightMaxKg * 10) / 10,
        unit: 'kg',
      };
    }

    setResult(calculatedResult);
    onCalculate(calculatedResult, data); // Pass original form data
  };

  const handleUnitChange = (value: 'metric' | 'imperial') => {
    setUnit(value);
    form.setValue('unit', value);
    // Reset height field
    form.reset({
      ...form.getValues(), // Keep gender
      height: undefined,
      unit: value
    });
    setResult(null);
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Ideal Weight Calculator</CardTitle>
        <Weight className="h-5 w-5 text-muted-foreground" />
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
                    <Input type="number" step="any" placeholder={`Enter height`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Calculate Ideal Weight
            </Button>
          </form>
        </Form>

        {result !== null && (
          <div className="mt-6 p-4 bg-secondary rounded-md text-center shadow-inner">
            <Label className="text-sm font-medium text-secondary-foreground">Estimated Ideal Weight Range:</Label>
            <p className="text-3xl font-bold text-primary">
              {result.idealWeightMin.toFixed(1)} - {result.idealWeightMax.toFixed(1)} {result.unit}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Based on the Devine formula (approximate range). Consult a healthcare professional for personalized advice.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    