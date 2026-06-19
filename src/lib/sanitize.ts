const SENSITIVE_KEYS = new Set(["passwordHash", "password", "temporaryPassword"]);

export function stripSensitiveFields<T extends Record<string, unknown>>(
  obj: T,
): Omit<T, "passwordHash" | "password" | "temporaryPassword"> {
  const result = { ...obj };

  for (const key of SENSITIVE_KEYS) {
    if (key in result) {
      delete result[key];
    }
  }

  return result as Omit<T, "passwordHash" | "password" | "temporaryPassword">;
}
