import { z } from 'zod';

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  
  // Blob Storage (for file uploads)
  BLOB_SERVICE_URL: z.string().min(1, "BLOB_SERVICE_URL is required"),
  BLOB_TOKEN: z.string().min(1, "BLOB_TOKEN is required"),
  
  // Add other environment variables as needed
  // NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validated environment variables
 */
export const env = envSchema.parse({
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Blob Storage
  BLOB_SERVICE_URL: process.env.BLOB_SERVICE_URL,
  BLOB_TOKEN: process.env.BLOB_TOKEN,
  
  // Add other environment variables as needed
  // NODE_ENV: process.env.NODE_ENV,
});

/**
 * Check if all required environment variables are set
 * @returns An object with success status and missing variables if any
 */
export function validateEnv() {
  try {
    // Validate environment variables
    envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      BLOB_SERVICE_URL: process.env.BLOB_SERVICE_URL,
      BLOB_TOKEN: process.env.BLOB_TOKEN,
    });
    
    return { 
      success: true 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.'));
      return {
        success: false,
        missingVars,
        message: `Missing required environment variables: ${missingVars.join(', ')}`
      };
    }
    
    return { 
      success: false,
      message: 'Failed to validate environment variables' 
    };
  }
}