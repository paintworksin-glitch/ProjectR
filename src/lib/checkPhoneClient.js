/**
 * Rate-limited server check via /api/check-phone (returns { available: boolean }).
 */
export async function checkPhoneAvailableRequest(digits, excludeUserId) {
  const res = await fetch("/api/check-phone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      digits,
      ...(excludeUserId ? { excludeUserId } : {}),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 429) {
    throw new Error("Too many attempts. Wait a minute and try again.");
  }
  if (!res.ok) {
    throw new Error(json?.error || "Could not verify phone number.");
  }
  return json.available === true;
}
