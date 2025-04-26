import { z } from "zod";

// BMI Calculator Schema
export const bmiSchema = z.object({
  height: z.coerce.number().positive("Height must be positive"),
  weight: z.coerce.number().positive("Weight must be positive"),
  unit: z.enum(['metric', 'imperial']).default('metric'),
});
export type BmiFormData = z.infer<typeof bmiSchema>;


// Calorie Intake Calculator Schema
export const calorieSchema = z.object({
  age: z.coerce.number().int().positive("Age must be a positive integer"),
  gender: z.enum(['male', 'female']),
  height: z.coerce.number().positive("Height must be positive"),
  weight: z.coerce.number().positive("Weight must be positive"),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  unit: z.enum(['metric', 'imperial']).default('metric'),
});
export type CalorieFormData = z.infer<typeof calorieSchema>;

// Target Heart Rate Calculator Schema
export const heartRateSchema = z.object({
  age: z.coerce.number().int().positive("Age must be a positive integer"),
});
export type HeartRateFormData = z.infer<typeof heartRateSchema>;