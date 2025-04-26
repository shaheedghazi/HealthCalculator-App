
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { WaterIntakeFormData } from "@/lib/validators";
import { waterIntakeSchema } from "@/lib/validators";
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
import { Droplet } from "lucide-react"; // Using Droplet icon for water

interface WaterIntakeCalculatorProps {
  onCalculate: (result: { dailyIntake: number; unit: string }, data: WaterIntakeFormData) => void;
}

// Base intake factors (can be adjusted) - oz per lb / ml per kg
const BASE_INTAKE_FACTOR_IMPERIAL = 0.5; // oz per lb of body weight
const BASE_INTAKE_FACTOR_METRIC = 30;    // ml per kg of body weight

// Activity multipliers (rough estimates)
const activityMultipliers = {
  sedentary: 1.0,
  light: 1.1,      // Add ~10%
  moderate: 1.25,   // Add ~25%
  active: 1.4,      // Add ~40%
  very_active: 1.6, // Add ~60%
};

export function WaterIntakeCalculator({ onCalculate }: WaterIntakeCalculatorProps) {
  const [result, setResult] = React.useState<{ dailyIntake: number; unit: string } | null>(null);
  const [unit, setUnit] = React.useState<'metric' | 'imperial'>('metric');

  const form = useForm<WaterIntakeFormData>({
    resolver: zodResolver(waterIntakeSchema),
    defaultValues: {
      weight: '', // Initialize with empty string
      activityLevel: undefined, // Keep select undefined
      unit: 'metric',
    },
  });

  const onSubmit = (data: WaterIntakeFormData) => {
    let weight = data.weight as number; // Zod ensures number if valid
    const activityLevel = data.activityLevel!; // Required by schema
    const currentUnit = data.unit;
    let baseIntake: number;
    let calculatedUnit: string;

    if (currentUnit === 'imperial') {
      // Calculate in ounces (oz)
      baseIntake = weight * BASE_INTAKE_FACTOR_IMPERIAL;
      calculatedUnit = 'oz';
    } else {
      // Calculate in milliliters (ml)
      baseIntake = weight * BASE_INTAKE_FACTOR_METRIC;
      calculatedUnit = 'ml';
    }

    // Adjust for activity level
    const adjustedIntake = baseIntake * activityMultipliers[activityLevel];

    // Optionally convert ml to liters for metric result display
    let finalIntake = adjustedIntake;
    if (calculatedUnit === 'ml') {
       finalIntake = adjustedIntake / 1000; // Convert ml to L
       calculatedUnit = 'Liters';
    } else {
       // Optionally convert oz to cups (8 oz/cup) or keep as oz
       // finalIntake = adjustedIntake / 8;
       // calculatedUnit = 'Cups';
       calculatedUnit = 'oz'; // Keeping oz for clarity
    }


    const roundedIntake = Math.round(finalIntake * 10) / 10; // Round to one decimal place

    const calculatedResult = { dailyIntake: roundedIntake, unit: calculatedUnit };
    setResult(calculatedResult);
    onCalculate(calculatedResult, data); // Pass original form data
  };

  const handleUnitChange = (value: 'metric' | 'imperial') => {
    setUnit(value);
    form.setValue('unit', value);
    // Reset weight field
    form.reset({
      ...form.getValues(), // Keep activity level
      weight: '',
      unit: value
    });
    setResult(null);
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Daily Water Intake</CardTitle>
        <Droplet className="h-5 w-5 text-muted-foreground" />
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
                      <SelectItem value="metric">Metric (kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs)</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input type="number" step="any" placeholder={`Enter weight`} {...field} onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                       <SelectItem value="light">Lightly active (light exercise/sports 1-3 days/week)</SelectItem>
                       <SelectItem value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</SelectItem>
                       <SelectItem value="active">Very active (hard exercise/sports 6-7 days a week)</SelectItem>
                       <SelectItem value="very_active">Extra active (very hard exercise/sports & physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Calculate Water Intake
            </Button>
          </form>
        </Form>

        {result !== null && (
          <div className="mt-6 p-4 bg-secondary rounded-md text-center shadow-inner">
            <Label className="text-sm font-medium text-secondary-foreground">Estimated Daily Water Intake:</Label>
            <p className="text-3xl font-bold text-primary">
               {result.dailyIntake.toFixed(1)} {result.unit}
            </p>
            <p className="text-xs text-muted-foreground mt-2">This is a general estimate. Individual needs vary based on climate, health status, etc. Listen to your body.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
