// lib/security/validation.ts
// Boundary validation schemas for SchoolFix authentication endpoints

import { z } from 'zod';

// Nigerian NCC Phone Number Regex: 11 digits starting with 070, 080, 081, 090, 091
const NIGERIAN_PHONE_REGEX = /^(070|080|081|090|091)\d{8}$/;

// 1. Parent Registration Schema (Enforcing all Task 3 rules at the server boundary)
export const RegisterSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(3, 'Full name must be at least 3 characters')
    .max(60, 'Full name cannot exceed 60 characters')
    .refine((val) => {
      const parts = val.trim().split(/\s+/);
      return parts.length >= 2 && parts.every((p) => p.length >= 2);
    }, {
      message: 'Full name must contain at least two words with a minimum of 2 characters each (e.g. Adeleke Folashade)',
    }),

  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),

  phone: z
    .string({ required_error: 'Nigerian phone number is required' })
    .trim()
    .regex(NIGERIAN_PHONE_REGEX, 'Must be an 11-digit Nigerian phone number starting with 070, 080, 081, 090, or 091'),

  password: z
    .string({ required_error: 'Password is required' })
    .transform((val) => val.trim()) // Trim whitespace per Step 5 specification
    .pipe(
      z
        .string()
        .min(8, 'Password must be at least 8 characters after whitespace trimming')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
    ),

  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the NDPA Privacy Policy and Terms of Service' }),
  }),

  nin: z
    .string()
    .trim()
    .optional(),
});

// 2. Login Schema (Email normalized & lowercased, password trimmed, format checked on-submit)
export const LoginSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .transform((val) => val.trim())
    .pipe(z.string().min(1, 'Password cannot be empty')),
});

// 3. Password Reset Request Schema
export const ResetRequestSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
});

// 4. Verification OTP Schema
export const VerifyOtpSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),

  code: z
    .string({ required_error: 'Verification code is required' })
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be exactly 6 numeric digits'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ResetRequestInput = z.infer<typeof ResetRequestSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
