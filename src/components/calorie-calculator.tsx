"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { CalorieFormData } from "@/lib/validators";
import { calorieSchema } from "@/lib/validators";
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
// Using an inline SVG for the food icon as lucide doesn't have a direct 'Food' icon
const FoodIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="none" fill="hsl(var(--muted-foreground))"/> {/* Heart as placeholder */}
    <path d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2Z" />
    <path d="M12 18H12.01" />
    <path d="M12 14H12.01" />
     <path d="M12 10H12.01" />
     <path d="M12 6H12.01" />
     <path d="M16 6H16.01" />
     <path d="M8 6H8.01" />
     <path d="M16 10H16.01" />
     <path d="M8 10H8.01" />
     <path d="M16 14H16.01" />
     <path d="M8 14H8.01" />
     <path d="M16 18H16.01" />
     <path d="M8 18H8.01" />
  </svg>
);

interface CalorieCalculatorProps {
  onCalculate: (result: number, data: CalorieFormData) => void;
}

const activityLevelMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function CalorieCalculator({ onCalculate }: CalorieCalculatorProps) {
  const [result, setResult] = React.useState<number | null>(null);
  const [unit, setUnit] = React.useState<'metric' | 'imperial'>('metric');

  const form = useForm<CalorieFormData>({
    resolver: zodResolver(calorieSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      height: undefined,
      weight: undefined,
      activityLevel: undefined,
      unit: 'metric',
    },
  });

 const onSubmit = (data: CalorieFormData) => {
    let height = data.height;
    let weight = data.weight;

    // Convert units if imperial
    if (data.unit === 'imperial') {
      height = height * 2.54; // inches to cm
      weight = weight * 0.453592; // lbs to kg
    }

    let bmr: number;

    // Calculate BMR using Harris-Benedict equation (revised)
    if (data.gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * data.age);
    } else { // female
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * data.age);
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityLevelMultipliers[data.activityLevel];
    const roundedTdee = Math.round(tdee);
    setResult(roundedTdee);
    onCalculate(roundedTdee, data); // Pass original form data
  };

  const handleUnitChange = (value: 'metric' | 'imperial') => {
    setUnit(value);
    form.setValue('unit', value);
    // Reset relevant fields on unit change
    form.reset({
      ...form.getValues(), // Keep other values
      height: undefined,
      weight: undefined,
      unit: value
    });
    setResult(null);
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Daily Calorie Intake</CardTitle>
        <FoodIcon />
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
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter your age" {...field} />
                  </FormControl>
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
                    <FormLabel>Height ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={`Enter height in ${unit === 'metric' ? 'cm' : 'inches'}`} {...field} />
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
                      <Input type="number" placeholder={`Enter weight in ${unit === 'metric' ? 'kg' : 'lbs'}`} {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              Calculate Calories
            </Button>
          </form>
        </Form>

        {result !== null && (
          <div className="mt-6 p-4 bg-secondary rounded-md text-center shadow-inner">
            <Label className="text-sm font-medium text-secondary-foreground">Estimated Daily Calorie Needs:</Label>
            <p className="text-3xl font-bold text-primary">{result} kcal</p>
             <p className="text-xs text-muted-foreground mt-1">This is an estimate for maintaining your current weight.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
