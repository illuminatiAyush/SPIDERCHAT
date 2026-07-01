import sanitize from "mongo-sanitize";

/**
 * Sanitizes input object or value by stripping keys that start with '$'
 * to prevent NoSQL Operator Injection.
 */
export function sanitizeInput<T>(input: T): T {
  if (typeof input === "string") {
    // Basic XSS prevention encoding for specific fields can go here,
    // though React handles mostly everything, it's good practice.
    // mongo-sanitize strips '$' operators from objects, but for strings we just return.
    return sanitize(input);
  }
  return sanitize(input);
}
