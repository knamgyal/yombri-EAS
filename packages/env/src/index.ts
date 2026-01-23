import { z } from 'zod';

export const clientEnvSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

export const validateEnv = (envVars: Record<string, string | undefined>) => {
  const parsed = clientEnvSchema.safeParse(envVars);
  if (!parsed.success) {
    console.error('Invalid env vars', parsed.error.format());
    return {};
  }
  return parsed.data;
};
