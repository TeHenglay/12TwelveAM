import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema, ZodIssue } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    errors?: Record<string, string[]>;
  };
  status: number;
}

/**
 * Validates request body against a Zod schema
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    // Handle potential JSON parsing errors
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return {
        success: false,
        error: {
          message: 'Invalid JSON in request body',
        },
        status: 400,
      };
    }

    // Apply schema validation
    try {
      const data = schema.parse(body);
      return {
        success: true,
        data,
        status: 200,
      };
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        
        const issues = zodError.issues || [];
        issues.forEach((err: ZodIssue) => {
          const path = err.path.length > 0 ? err.path.join('.') : '_general';
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });
        
        return {
          success: false,
          error: {
            message: 'Validation failed',
            errors: formattedErrors,
          },
          status: 400,
        };
      }
      
      // Handle any other schema validation errors
      return {
        success: false,
        error: {
          message: zodError instanceof Error ? zodError.message : 'Invalid request data',
        },
        status: 400,
      };
    }
  } catch (error) {
    // Handle any other unexpected errors
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Invalid request body',
      },
      status: 400,
    };
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const url = new URL(request.url);
    const queryObj: Record<string, any> = {};
    
    url.searchParams.forEach((value, key) => {
      // Convert numeric strings to numbers
      if (key === 'page' || key === 'limit' || key === 'minPrice' || key === 'maxPrice') {
        const numValue = Number(value);
        queryObj[key] = isNaN(numValue) ? value : numValue;
      } else if (key === 'inStock') {
        queryObj[key] = value === 'true';
      } else {
        queryObj[key] = value;
      }
    });
    
    try {
      const data = schema.parse(queryObj);
      return {
        success: true,
        data,
        status: 200,
      };
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        
        const issues = zodError.issues || [];
        issues.forEach((err: ZodIssue) => {
          const path = err.path.length > 0 ? err.path.join('.') : '_general';
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });
        
        return {
          success: false,
          error: {
            message: 'Validation failed',
            errors: formattedErrors,
          },
          status: 400,
        };
      }
      
      return {
        success: false,
        error: {
          message: zodError instanceof Error ? zodError.message : 'Invalid query parameters',
        },
        status: 400,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Invalid query parameters',
      },
      status: 400,
    };
  }
}

/**
 * Validates path parameters against a Zod schema
 */
export function validateParams<T>(
  params: Record<string, string>,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    try {
      const data = schema.parse(params);
      return {
        success: true,
        data,
        status: 200,
      };
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        
        const issues = zodError.issues || [];
        issues.forEach((err: ZodIssue) => {
          const path = err.path.length > 0 ? err.path.join('.') : '_general';
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });
        
        return {
          success: false,
          error: {
            message: 'Invalid parameters',
            errors: formattedErrors,
          },
          status: 400,
        };
      }
      
      return {
        success: false,
        error: {
          message: zodError instanceof Error ? zodError.message : 'Invalid parameters',
        },
        status: 400,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Invalid parameters',
      },
      status: 400,
    };
  }
}

/**
 * Creates a validation error response
 */
export function validationErrorResponse(result: ValidationResult<unknown>): NextResponse {
  return NextResponse.json(
    { error: result.error },
    { status: result.status }
  );
}