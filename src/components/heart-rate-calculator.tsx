
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { HeartRateFormData } from "@/lib/validators";
import { heartRateSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse } from "lucide-react";

interface HeartRateCalculatorProps {
   onCalculate: (result: { lower: number; upper: number }, data: HeartRateFormData) => void;
}

export function HeartRateCalculator({ onCalculate }: HeartRateCalculatorProps) {
  const [result, setResult] = React.useState<{ lower: number; upper: number } | null>(null);

  const form = useForm<HeartRateFormData>({
    resolver: zodResolver(heartRateSchema),
    defaultValues: {
      age: '', // Initialize with empty string
    },
  });

   const onSubmit = (data: HeartRateFormData) => {
    const age = data.age as number; // Zod ensures it's a number if validation passes
    // Use the simpler 220 - age formula for Max Heart Rate
    const maxHeartRate = 220 - age;
    // Standard target zone: 50% to 85% of MHR
    const lowerBound = Math.round(maxHeartRate * 0.50);
    const upperBound = Math.round(maxHeartRate * 0.85);
    const calculatedResult = { lower: lowerBound, upper: upperBound };
    setResult(calculatedResult);
    onCalculate(calculatedResult, data);
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Target Heart Rate Zone</CardTitle>
         <HeartPulse className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your age"
                      {...field}
                      onChange={e => field.onChange(e.target.value === '' ? '' : e.target.value)} // Handle empty input
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Calculate Heart Rate Zone
            </Button>
          </form>
        </Form>

        {result !== null && (
          <div className="mt-6 p-4 bg-secondary rounded-md text-center shadow-inner">
            <Label className="text-sm font-medium text-secondary-foreground">Target Heart Rate Zone (50-85% Intensity):</Label>
            <p className="text-3xl font-bold text-primary">
              {result.lower} - {result.upper} bpm
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (bpm = beats per minute)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This is a general estimate. Consult a healthcare professional before starting or modifying an exercise program.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
