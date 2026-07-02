import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL is required and must be a URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
});

export const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(), // Optional for local UI dev if unused
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  TESSARION_APP_URL: z.string().url().default('http://localhost:3000'),
});

// Validate Client Env
const clientParsed = clientSchema.safeParse(process.env);
if (!clientParsed.success) {
  console.error('Client env validation failed:', clientParsed.error.format());
}

export const clientEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key",
} as const;

// Validate Server Env (Only run on server)
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  geminiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  appUrl: process.env.TESSARION_APP_URL || 'http://localhost:3000',
} as const;
