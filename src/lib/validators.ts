
import { z } from "zod";

// Shared unit enum
const UnitSystemEnum = z.enum(['metric', 'imperial']).default('metric');

// Custom coercion for number fields that allows empty string initially
const numberOrEmptyString = z.union([
  z.string().length(0), // Allow empty string
  z.coerce.number().positive("Must be a positive number")
]).pipe(z.coerce.number().positive("Must be a positive number")); // Ensure final type is positive number

const positiveIntegerOrEmptyString = z.union([
    z.string().length(0),
    z.coerce.number().int().min(1, "Must be at least 1").max(120, "Age seems too high")
]).pipe(z.coerce.number().int().min(1, "Must be at least 1").max(120, "Age seems too high"));

// BMI Calculator Schema
export const bmiSchema = z.object({
  height: numberOrEmptyString,
  weight: numberOrEmptyString,
  unit: UnitSystemEnum,
});
export type BmiFormData = z.infer<typeof bmiSchema>;


// Calorie Intake Calculator Schema
export const calorieSchema = z.object({
  age: positiveIntegerOrEmptyString,
  gender: z.enum(['male', 'female'], { required_error: "Gender is required" }),
  height: numberOrEmptyString,
  weight: numberOrEmptyString,
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'], { required_error: "Activity level is required" }),
  unit: UnitSystemEnum,
});
export type CalorieFormData = z.infer<typeof calorieSchema>;

// Target Heart Rate Calculator Schema
export const heartRateSchema = z.object({
  age: positiveIntegerOrEmptyString,
});
export type HeartRateFormData = z.infer<typeof heartRateSchema>;

// Body Fat Calculator Schema (U.S. Navy Method)
export const bodyFatSchema = z.object({
  gender: z.enum(['male', 'female'], { required_error: "Gender is required" }),
  height: numberOrEmptyString,
  neck: numberOrEmptyString,
  waist: numberOrEmptyString,
  // Hip: allow empty string initially, refine handles requirement
  hip: z.union([z.string().length(0), z.coerce.number().positive("Hip circumference must be positive")]).optional(),
  unit: UnitSystemEnum,
}).refine(data => {
    if (data.gender === 'female') {
        // If female, hip must be a positive number (coercion already attempted)
        return typeof data.hip === 'number' && data.hip > 0;
    }
    // If male, hip is not required
    return true;
 }, {
  message: "Hip circumference is required and must be positive for females",
  path: ["hip"], // Specify the path of the error
}).transform(data => {
    // Ensure hip is number or undefined after validation
    if (data.gender === 'female' && typeof data.hip !== 'number') {
        // This state should ideally not be reached if refine works correctly,
        // but it's a safeguard. We might throw or handle differently.
        // For now, let's ensure it's undefined if not a valid number for female.
        // However, the refine should catch this.
         return { ...data, hip: undefined }; // Or handle as an error
    }
     // Ensure hip is undefined for males before returning
    if (data.gender === 'male') {
        return { ...data, hip: undefined };
    }

    // Coerce hip to number if it passed validation (was positive number string or number)
    if (typeof data.hip === 'string' && data.hip !== '') {
         return { ...data, hip: Number(data.hip) };
    }


    return data; // Return data as is for male or if hip is already number/undefined correctly
});
export type BodyFatFormData = z.infer<typeof bodyFatSchema>;


// Ideal Weight Calculator Schema (using Devine formula for simplicity)
export const idealWeightSchema = z.object({
    gender: z.enum(['male', 'female'], { required_error: "Gender is required" }),
    height: numberOrEmptyString,
    unit: UnitSystemEnum,
});
export type IdealWeightFormData = z.infer<typeof idealWeightSchema>;


// Waist-to-Hip Ratio (WHR) Calculator Schema
export const whrSchema = z.object({
    waist: numberOrEmptyString,
    hip: numberOrEmptyString,
    // Gender is optional for WHR calculation itself but good for context/risk
    gender: z.enum(['male', 'female']).optional(),
    unit: UnitSystemEnum,
});
export type WhrFormData = z.infer<typeof whrSchema>;

// Water Intake Calculator Schema
export const waterIntakeSchema = z.object({
  weight: numberOrEmptyString,
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'], { required_error: "Activity level is required" }), // Using same levels as calorie calc for consistency
  unit: UnitSystemEnum,
});
export type WaterIntakeFormData = z.infer<typeof waterIntakeSchema>;
