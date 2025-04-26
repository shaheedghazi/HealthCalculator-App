"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BmiCalculator } from "@/components/bmi-calculator";
import { CalorieCalculator } from "@/components/calorie-calculator";
import { HeartRateCalculator } from "@/components/heart-rate-calculator";
import { HealthTips } from "@/components/health-tips";
import { personalizedHealthTips } from "@/ai/flows/personalized-health-tips";
import type { PersonalizedHealthTipsInput, PersonalizedHealthTipsOutput } from "@/ai/flows/personalized-health-tips";
import type { BmiFormData, CalorieFormData, HeartRateFormData } from "@/lib/validators";
import { BrainCircuit } from "lucide-react";

type CalculatorType = 'BMI' | 'Calorie Intake' | 'Target Heart Rate';

export default function Home() {
  const [activeCalculator, setActiveCalculator] = React.useState<CalculatorType>('BMI');
  const [healthTips, setHealthTips] = React.useState<PersonalizedHealthTipsOutput | null>(null);
  const [isLoadingTips, setIsLoadingTips] = React.useState<boolean>(false);
  const [errorTips, setErrorTips] = React.useState<string | null>(null);
  const [lastResult, setLastResult] = React.useState<string | null>(null);
  const [lastUserData, setLastUserData] = React.useState<string | null>(null);


   const handleCalculation = async (
      calculatorType: CalculatorType,
      result: number | { lower: number; upper: number },
      data: BmiFormData | CalorieFormData | HeartRateFormData
    ) => {
      setActiveCalculator(calculatorType);
      setIsLoadingTips(true);
      setErrorTips(null);
      setHealthTips(null); // Clear previous tips

      const resultString = typeof result === 'number'
        ? result.toString()
        : `Lower: ${result.lower} bpm, Upper: ${result.upper} bpm`;

      setLastResult(resultString);

      let userDataString = '';
      if ('age' in data) userDataString += `Age: ${data.age}. `;
      if ('gender' in data) userDataString += `Gender: ${data.gender}. `;
      if ('activityLevel' in data) userDataString += `Activity Level: ${data.activityLevel}. `;
      if ('height' in data && 'weight' in data) userDataString += `Height: ${data.height}${data.unit === 'metric' ? 'cm' : 'in'}. Weight: ${data.weight}${data.unit === 'metric' ? 'kg' : 'lbs'}. Unit: ${data.unit}.`

      setLastUserData(userDataString.trim() || 'N/A');

      const input: PersonalizedHealthTipsInput = {
        calculatorType: calculatorType,
        calculatorResult: resultString,
        userData: userDataString.trim() || undefined, // Pass undefined if empty
      };

      try {
        const tipsOutput = await personalizedHealthTips(input);
        setHealthTips(tipsOutput);
      } catch (error) {
        console.error("Error fetching health tips:", error);
        setErrorTips("Failed to generate health tips. Please try again later.");
      } finally {
        setIsLoadingTips(false);
      }
   };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-12 bg-secondary">
      <div className="w-full max-w-4xl">
         <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">HealthCalc Hub</h1>
            <p className="text-lg text-muted-foreground">Your personal health calculation toolkit.</p>
         </header>

        <Tabs defaultValue="bmi" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-primary/10">
            <TabsTrigger value="bmi" onClick={() => setActiveCalculator('BMI')}>BMI</TabsTrigger>
            <TabsTrigger value="calorie" onClick={() => setActiveCalculator('Calorie Intake')}>Calories</TabsTrigger>
            <TabsTrigger value="heartRate" onClick={() => setActiveCalculator('Target Heart Rate')}>Heart Rate</TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-6">
             <div className="flex-1 flex justify-center">
                <TabsContent value="bmi" className="w-full flex justify-center mt-0">
                   <BmiCalculator onCalculate={(result, data) => handleCalculation('BMI', result, data)} />
                 </TabsContent>
                <TabsContent value="calorie" className="w-full flex justify-center mt-0">
                   <CalorieCalculator onCalculate={(result, data) => handleCalculation('Calorie Intake', result, data)} />
                 </TabsContent>
                <TabsContent value="heartRate" className="w-full flex justify-center mt-0">
                   <HeartRateCalculator onCalculate={(result, data) => handleCalculation('Target Heart Rate', result, data)} />
                 </TabsContent>
             </div>

              {/* Tips section */}
              <div className="flex-1 flex justify-center items-start">
                 { (healthTips || isLoadingTips || errorTips) && (
                    <HealthTips
                     tips={healthTips}
                     isLoading={isLoadingTips}
                     error={errorTips}
                     calculatorType={activeCalculator}
                   />
                 )}
                 {/* Placeholder when no tips are loading/shown */}
                 { !healthTips && !isLoadingTips && !errorTips && (
                     <Card className="w-full max-w-md mt-6 shadow-lg rounded-lg border border-dashed border-muted-foreground/50 bg-background/50 flex flex-col items-center justify-center p-8 text-center">
                         <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4"/>
                         <CardTitle className="text-lg font-semibold mb-2">Personalized Tips Appear Here</CardTitle>
                         <CardDescription>Calculate using one of the tools to get AI-powered health suggestions based on your results.</CardDescription>
                      </Card>
                  )}
               </div>
          </div>
        </Tabs>

         <footer className="text-center mt-12 text-xs text-muted-foreground">
              <p>Disclaimer: The calculators and tips provided are for informational purposes only and are not a substitute for professional medical advice. Always consult with a healthcare provider for any health concerns or before making any decisions related to your health or treatment.</p>
              <p>&copy; {new Date().getFullYear()} HealthCalc Hub. All rights reserved.</p>
          </footer>
      </div>
    </main>
  );
}
