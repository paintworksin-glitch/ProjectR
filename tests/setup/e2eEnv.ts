export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

export function hasEnv(name: string): boolean {
  return Boolean(process.env[name]);
}
