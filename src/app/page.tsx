
"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BmiCalculator } from "@/components/bmi-calculator";
import { CalorieCalculator } from "@/components/calorie-calculator";
import { HeartRateCalculator } from "@/components/heart-rate-calculator";
import { BodyFatCalculator } from "@/components/body-fat-calculator";
import { IdealWeightCalculator } from "@/components/ideal-weight-calculator";
import { WhrCalculator } from "@/components/whr-calculator";
import { WaterIntakeCalculator } from "@/components/water-intake-calculator";

import { HealthTips } from "@/components/health-tips";
import { personalizedHealthTips } from "@/ai/flows/personalized-health-tips";
import type { PersonalizedHealthTipsInput, PersonalizedHealthTipsOutput } from "@/ai/flows/personalized-health-tips";
import type { BmiFormData, CalorieFormData, HeartRateFormData, BodyFatFormData, IdealWeightFormData, WhrFormData, WaterIntakeFormData } from "@/lib/validators";
import { BrainCircuit } from "lucide-react";

type CalculatorType = 'BMI' | 'Calorie Intake' | 'Target Heart Rate' | 'Body Fat %' | 'Ideal Weight' | 'WHR' | 'Water Intake';

export default function Home() {
  const [activeCalculator, setActiveCalculator] = React.useState<CalculatorType>('BMI');
  const [healthTips, setHealthTips] = React.useState<PersonalizedHealthTipsOutput | null>(null);
  const [isLoadingTips, setIsLoadingTips] = React.useState<boolean>(false);
  const [errorTips, setErrorTips] = React.useState<string | null>(null);
  const [lastResult, setLastResult] = React.useState<string | null>(null);
  const [lastUserData, setLastUserData] = React.useState<string | null>(null);

  const handleCalculation = async (
    calculatorType: CalculatorType,
    result: number | { lower: number; upper: number } | { bodyFat: number; category: string } | { idealWeightMin: number; idealWeightMax: number; unit: string } | { ratio: number; risk: string } | { dailyIntake: number; unit: string },
    data: BmiFormData | CalorieFormData | HeartRateFormData | BodyFatFormData | IdealWeightFormData | WhrFormData | WaterIntakeFormData
  ) => {
    setActiveCalculator(calculatorType);
    setIsLoadingTips(true);
    setErrorTips(null);
    setHealthTips(null); // Clear previous tips

    let resultString: string;
    let userDataString = '';
    const unitSystem = 'unit' in data ? data.unit : 'metric'; // Default or extract unit system

    // Format result based on calculator type
    switch (calculatorType) {
        case 'BMI':
            resultString = `${result as number} kg/m²`;
            const bmiData = data as BmiFormData;
            userDataString = `Height: ${bmiData.height}${unitSystem === 'metric' ? 'cm' : 'in'}, Weight: ${bmiData.weight}${unitSystem === 'metric' ? 'kg' : 'lbs'}, Unit System: ${unitSystem}.`;
            break;
        case 'Calorie Intake':
            resultString = `${result as number} kcal/day`;
            const calorieData = data as CalorieFormData;
            userDataString = `Age: ${calorieData.age}, Gender: ${calorieData.gender}, Height: ${calorieData.height}${unitSystem === 'metric' ? 'cm' : 'in'}, Weight: ${calorieData.weight}${unitSystem === 'metric' ? 'kg' : 'lbs'}, Activity Level: ${calorieData.activityLevel}, Unit System: ${unitSystem}.`;
            break;
        case 'Target Heart Rate':
            const hrResult = result as { lower: number; upper: number };
            resultString = `Zone: ${hrResult.lower} - ${hrResult.upper} bpm`;
             const hrData = data as HeartRateFormData;
             userDataString = `Age: ${hrData.age}.`;
            break;
        case 'Body Fat %':
             const bfResult = result as { bodyFat: number; category: string };
             resultString = `Body Fat: ${bfResult.bodyFat.toFixed(1)}% (${bfResult.category})`;
             const bfData = data as BodyFatFormData;
             userDataString = `Gender: ${bfData.gender}, Height: ${bfData.height}${unitSystem === 'metric' ? 'cm' : 'in'}, Neck: ${bfData.neck}${unitSystem === 'metric' ? 'cm' : 'in'}, Waist: ${bfData.waist}${unitSystem === 'metric' ? 'cm' : 'in'}, ${bfData.gender === 'female' ? `Hip: ${bfData.hip}${unitSystem === 'metric' ? 'cm' : 'in'}, ` : ''}Unit System: ${unitSystem}.`;
             break;
        case 'Ideal Weight':
            const iwResult = result as { idealWeightMin: number; idealWeightMax: number; unit: string };
            resultString = `Range: ${iwResult.idealWeightMin.toFixed(1)} - ${iwResult.idealWeightMax.toFixed(1)} ${iwResult.unit}`;
             const iwData = data as IdealWeightFormData;
             userDataString = `Gender: ${iwData.gender}, Height: ${iwData.height}${unitSystem === 'metric' ? 'cm' : 'in'}, Unit System: ${unitSystem}.`;
            break;
        case 'WHR':
             const whrResult = result as { ratio: number; risk: string };
             resultString = `Ratio: ${whrResult.ratio.toFixed(2)}, Risk: ${whrResult.risk}`;
             const whrData = data as WhrFormData;
             userDataString = `Waist: ${whrData.waist}${unitSystem === 'metric' ? 'cm' : 'in'}, Hip: ${whrData.hip}${unitSystem === 'metric' ? 'cm' : 'in'}, Unit System: ${unitSystem}.`;
             if (whrData.gender) userDataString += ` Gender: ${whrData.gender}.`; // Add gender if provided
             break;
        case 'Water Intake':
             const waterResult = result as { dailyIntake: number; unit: string };
             resultString = `Recommended Intake: ${waterResult.dailyIntake.toFixed(1)} ${waterResult.unit}/day`;
             const waterData = data as WaterIntakeFormData;
             userDataString = `Weight: ${waterData.weight}${unitSystem === 'metric' ? 'kg' : 'lbs'}, Activity Level: ${waterData.activityLevel}, Unit System: ${unitSystem}.`;
             break;
        default:
            resultString = JSON.stringify(result); // Fallback
            userDataString = JSON.stringify(data); // Fallback
    }


    setLastResult(resultString);
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
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 lg:p-12 bg-secondary/50">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">HealthCalc Hub</h1>
          <p className="text-lg md:text-xl text-muted-foreground">Your comprehensive health calculation toolkit.</p>
        </header>

        <Tabs defaultValue="bmi" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 mb-8 bg-primary/10 p-2 h-auto rounded-lg">
            <TabsTrigger value="bmi" onClick={() => setActiveCalculator('BMI')} className="text-xs sm:text-sm">BMI</TabsTrigger>
            <TabsTrigger value="calorie" onClick={() => setActiveCalculator('Calorie Intake')} className="text-xs sm:text-sm">Calories</TabsTrigger>
            <TabsTrigger value="heartRate" onClick={() => setActiveCalculator('Target Heart Rate')} className="text-xs sm:text-sm">Heart Rate</TabsTrigger>
            <TabsTrigger value="bodyFat" onClick={() => setActiveCalculator('Body Fat %')} className="text-xs sm:text-sm">Body Fat %</TabsTrigger>
            <TabsTrigger value="idealWeight" onClick={() => setActiveCalculator('Ideal Weight')} className="text-xs sm:text-sm">Ideal Wt</TabsTrigger>
            <TabsTrigger value="whr" onClick={() => setActiveCalculator('WHR')} className="text-xs sm:text-sm">WHR</TabsTrigger>
             <TabsTrigger value="waterIntake" onClick={() => setActiveCalculator('Water Intake')} className="text-xs sm:text-sm">Water</TabsTrigger>
          </TabsList>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Calculators Column */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <TabsContent value="bmi" className="mt-0">
                  <BmiCalculator onCalculate={(result, data) => handleCalculation('BMI', result, data)} />
                </TabsContent>
                <TabsContent value="calorie" className="mt-0">
                  <CalorieCalculator onCalculate={(result, data) => handleCalculation('Calorie Intake', result, data)} />
                </TabsContent>
                <TabsContent value="heartRate" className="mt-0">
                  <HeartRateCalculator onCalculate={(result, data) => handleCalculation('Target Heart Rate', result, data)} />
                </TabsContent>
                <TabsContent value="bodyFat" className="mt-0">
                   <BodyFatCalculator onCalculate={(result, data) => handleCalculation('Body Fat %', result, data)} />
                 </TabsContent>
                <TabsContent value="idealWeight" className="mt-0">
                   <IdealWeightCalculator onCalculate={(result, data) => handleCalculation('Ideal Weight', result, data)} />
                 </TabsContent>
                 <TabsContent value="whr" className="mt-0">
                    <WhrCalculator onCalculate={(result, data) => handleCalculation('WHR', result, data)} />
                 </TabsContent>
                 <TabsContent value="waterIntake" className="mt-0">
                   <WaterIntakeCalculator onCalculate={(result, data) => handleCalculation('Water Intake', result, data)} />
                 </TabsContent>
              </div>
            </div>

            {/* Tips Column */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
              <div className="w-full max-w-md">
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
                     <Card className="w-full shadow-lg rounded-lg border border-dashed border-muted-foreground/50 bg-background/50 flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
                         <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4"/>
                         <CardTitle className="text-lg font-semibold mb-2">Personalized Tips Appear Here</CardTitle>
                         <CardDescription>Use any calculator to get AI-powered health suggestions based on your results.</CardDescription>
                      </Card>
                  )}
               </div>
            </div>
          </div>
        </Tabs>

        <footer className="text-center mt-16 text-xs text-muted-foreground px-4">
          <p>Disclaimer: The calculators and tips provided are for informational purposes only and are not a substitute for professional medical advice. Always consult with a healthcare provider for any health concerns or before making any decisions related to your health or treatment.</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} HealthCalc Hub. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

    