export const FROZEN_LOGIN_MESSAGE =
  "Your account is frozen. Please contact the coach or gym owner.";

export const INVALID_CREDENTIALS_MESSAGE =
  "Invalid email or password. Please try again.";

const FROZEN_SIGNALS = [
  "frozen",
  "account frozen",
  "account is frozen",
  "your account is frozen",
  "please contact the coach",
];

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

function collectLoginErrorText(result: {
  error?: string | null;
  url?: string | null;
}): string {
  const parts: string[] = [];

  if (result.error) {
    parts.push(decodeSafe(result.error));
  }

  if (result.url) {
    parts.push(decodeSafe(result.url));

    try {
      const parsed = new URL(result.url, "http://localhost");
      const errorParam = parsed.searchParams.get("error");

      if (errorParam) {
        parts.push(decodeSafe(errorParam));
      }
    } catch {
      // Ignore malformed URLs.
    }
  }

  return parts.join(" ").toLowerCase();
}

export function isFrozenLoginError(result: {
  error?: string | null;
  url?: string | null;
}): boolean {
  const text = collectLoginErrorText(result);
  return FROZEN_SIGNALS.some((signal) => text.includes(signal));
}

export function isFrozenAccessMessage(message: string): boolean {
  const text = message.toLowerCase();
  return FROZEN_SIGNALS.some((signal) => text.includes(signal));
}

export function resolveLoginErrorMessage(result: {
  error?: string | null;
  url?: string | null;
}): string {
  if (isFrozenLoginError(result)) {
    return FROZEN_LOGIN_MESSAGE;
  }

  return INVALID_CREDENTIALS_MESSAGE;
}
