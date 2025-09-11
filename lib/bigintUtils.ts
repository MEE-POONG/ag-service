// Utility functions for handling BigInt serialization in API responses

/**
 * Converts BigInt values to numbers in an object recursively
 * Safe for values that fit in JavaScript's Number.MAX_SAFE_INTEGER
 */
export function serializeBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigIntToNumber);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigIntToNumber(value);
    }
    return result;
  }
  
  return obj;
}

/**
 * Converts BigInt values to strings in an object recursively
 * Use this for very large numbers that might exceed Number.MAX_SAFE_INTEGER
 */
export function serializeBigIntToString(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigIntToString);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigIntToString(value);
    }
    return result;
  }
  
  return obj;
}