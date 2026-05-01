// Shared in-memory store for verification codes
// In production, replace with Redis or database storage

interface StoredCode {
  code: string;
  expiresAt: number;
  attempts: number;
}

// Global singleton map to share across API routes in the same process
const globalForCodes = globalThis as typeof globalThis & {
  _verificationCodes?: Map<string, StoredCode>;
};

if (!globalForCodes._verificationCodes) {
  globalForCodes._verificationCodes = new Map<string, StoredCode>();
}

export function getCodeStore(): Map<string, StoredCode> {
  return globalForCodes._verificationCodes!;
}
