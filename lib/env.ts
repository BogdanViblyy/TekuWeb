// lib/env.ts
// Startup validation for required environment variables.
// Import this early (e.g., in middleware.ts or layout.tsx) to fail fast.

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please check your .env file. See .env.example for reference.`
    );
  }
  return value;
}

export const env = {
  DATABASE_URL: getRequiredEnvVar('DATABASE_URL'),
  JWT_SECRET: getRequiredEnvVar('JWT_SECRET'),
} as const;

// Pre-encoded JWT secret for use with jose
export const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);
