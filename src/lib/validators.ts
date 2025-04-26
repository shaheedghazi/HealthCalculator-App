import { z } from "zod";

// Shared unit enum
const UnitSystemEnum = z.enum(['metric', 'imperial']).default('metric');

// BMI Calculator Schema
export const bmiSchema = z.object({
  height: z.coerce.number().positive("Height must be positive"),
  weight: z.coerce.number().positive("Weight must be positive"),
  unit: UnitSystemEnum,
});
export type BmiFormData = z.infer<typeof bmiSchema>;


// Calorie Intake Calculator Schema
export const calorieSchema = z.object({
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(120, "Age seems too high"),
  gender: z.enum(['male', 'female']),
  height: z.coerce.number().positive("Height must be positive"),
  weight: z.coerce.number().positive("Weight must be positive"),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  unit: UnitSystemEnum,
});
export type CalorieFormData = z.infer<typeof calorieSchema>;

// Target Heart Rate Calculator Schema
export const heartRateSchema = z.object({
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(120, "Age seems too high"),
});
export type HeartRateFormData = z.infer<typeof heartRateSchema>;

// Body Fat Calculator Schema (U.S. Navy Method)
export const bodyFatSchema = z.object({
  gender: z.enum(['male', 'female']),
  height: z.coerce.number().positive("Height must be positive"),
  neck: z.coerce.number().positive("Neck circumference must be positive"),
  waist: z.coerce.number().positive("Waist circumference must be positive"),
  hip: z.coerce.number().positive("Hip circumference must be positive").optional(), // Required only for female
  unit: UnitSystemEnum,
}).refine(data => data.gender === 'male' || (data.gender === 'female' && data.hip !== undefined && data.hip > 0), {
  message: "Hip circumference is required for females",
  path: ["hip"], // Specify the path of the error
});
export type BodyFatFormData = z.infer<typeof bodyFatSchema>;


// Ideal Weight Calculator Schema (using Devine formula for simplicity)
export const idealWeightSchema = z.object({
    gender: z.enum(['male', 'female']),
    height: z.coerce.number().positive("Height must be positive"),
    unit: UnitSystemEnum,
});
export type IdealWeightFormData = z.infer<typeof idealWeightSchema>;


// Waist-to-Hip Ratio (WHR) Calculator Schema
export const whrSchema = z.object({
    waist: z.coerce.number().positive("Waist circumference must be positive"),
    hip: z.coerce.number().positive("Hip circumference must be positive"),
    gender: z.enum(['male', 'female']).optional(), // Gender is optional for WHR calculation itself but good for context
    unit: UnitSystemEnum,
});
export type WhrFormData = z.infer<typeof whrSchema>;

// Water Intake Calculator Schema
export const waterIntakeSchema = z.object({
  weight: z.coerce.number().positive("Weight must be positive"),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']), // Using same levels as calorie calc for consistency
  unit: UnitSystemEnum,
});
export type WaterIntakeFormData = z.infer<typeof waterIntakeSchema>;
    