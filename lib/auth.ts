/**
 * Helper functions for custom email/password authentication
 * Uses environment variables to validate credentials
 */

export function validateCredentials(
  email: string,
  password: string
): boolean {
  const allowedEmails = process.env.AUTH_ALLOWED_EMAILS || "";
  const sharedPassword = process.env.AUTH_SHARED_PASSWORD || "";

  // Split comma-separated emails and trim whitespace
  const emailList = allowedEmails
    .split(",")
    .map((e) => e.trim().toLowerCase());

  // Check if email is in the allowed list and password matches
  return (
    emailList.includes(email.toLowerCase()) &&
    password === sharedPassword
  );
}
