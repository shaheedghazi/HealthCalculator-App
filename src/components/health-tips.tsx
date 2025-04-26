"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb } from "lucide-react";
import type { PersonalizedHealthTipsOutput } from "@/ai/flows/personalized-health-tips";

interface HealthTipsProps {
  tips: PersonalizedHealthTipsOutput | null;
  isLoading: boolean;
  error: string | null;
  calculatorType: string;
}

export function HealthTips({ tips, isLoading, error, calculatorType }: HealthTipsProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mt-6 shadow-lg rounded-lg animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Lightbulb className="h-5 w-5 text-accent" />
            Personalized Health Tips
          </CardTitle>
          <CardDescription>Generating tips based on your {calculatorType} results...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
           <div className="flex justify-center items-center pt-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!tips || tips.healthTips.length === 0) {
    return null; // Don't show the card if there are no tips and no loading/error
  }

  return (
    <Card className="w-full max-w-md mt-6 shadow-lg rounded-lg border border-accent/50 bg-accent/5">
        <CardHeader>
           <CardTitle className="flex items-center gap-2 text-accent">
              <Lightbulb className="h-5 w-5" />
             Personalized Health Tips
           </CardTitle>
           <CardDescription>Based on your {calculatorType} results:</CardDescription>
        </CardHeader>
       <CardContent>
         <ul className="space-y-2 list-disc list-inside text-sm">
           {tips.healthTips.map((tip, index) => (
             <li key={index}>{tip}</li>
           ))}
         </ul>
         {tips.disclaimer && (
           <p className="text-xs text-muted-foreground mt-4 italic">{tips.disclaimer}</p>
         )}
       </CardContent>
     </Card>
  );
}
