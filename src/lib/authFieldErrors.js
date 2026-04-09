/**
 * Map Supabase Auth errors to user-facing, field-scoped messages (login / signup).
 */

/** PostgREST / Postgres duplicate row (e.g. profiles already created by DB trigger). */
export function isPostgresDuplicateKeyError(error) {
  const m = String(error?.message || error || "").toLowerCase();
  return m.includes("duplicate key") || m.includes("unique constraint") || m.includes("profiles_pkey");
}

export function mapSignInError(error) {
  const raw = String(error?.message || error || "");
  const msg = raw.toLowerCase();
  const out = { email: "", password: "", general: "" };

  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    out.password = "Incorrect email or password.";
    return out;
  }
  if (msg.includes("email not confirmed")) {
    out.email = "Please confirm your email before signing in. Check your inbox.";
    return out;
  }
  if (msg.includes("too many requests") || msg.includes("rate limit") || msg.includes("security purposes")) {
    out.general = "Too many attempts. Wait a minute and try again.";
    return out;
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    out.general = "Network error. Check your connection and try again.";
    return out;
  }
  out.general = raw || "Could not sign in. Please try again.";
  return out;
}

export function mapSignUpError(error) {
  const raw = String(error?.message || error || "");
  const msg = raw.toLowerCase();
  const out = { name: "", email: "", phone: "", password: "", confirmPassword: "", general: "" };

  if (isPostgresDuplicateKeyError(error)) {
    const d = msg.includes("mobile") || msg.includes("phone");
    if (d) {
      out.phone = "This mobile number is already used on another account.";
      return out;
    }
    out.general =
      "This email is already registered, or your profile row already exists. Use Sign in, or wait a moment and try again.";
    return out;
  }
  if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("user already registered")) {
    out.email = "An account with this email already exists. Sign in instead.";
    return out;
  }
  if (msg.includes("invalid email")) {
    out.email = "Enter a valid email address.";
    return out;
  }
  if (msg.includes("password") && (msg.includes("short") || msg.includes("least"))) {
    out.password = "Password does not meet requirements.";
    return out;
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    out.general = "Network error. Check your connection and try again.";
    return out;
  }
  out.general = raw || "Could not create account. Please try again.";
  return out;
}

export function mapResetPasswordEmailError(error) {
  const raw = String(error?.message || error || "");
  const msg = raw.toLowerCase();
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }
  return raw || "Could not send reset email.";
}
