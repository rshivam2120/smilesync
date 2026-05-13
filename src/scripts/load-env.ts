import { config, parse } from "dotenv";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();

function loadIfExists(filename: string, override: boolean) {
  const path = resolve(root, filename);
  if (existsSync(path)) {
    config({ path, override });
    return true;
  }
  return false;
}

const hasLocal = existsSync(resolve(root, ".env.local"));
const hasEnv = existsSync(resolve(root, ".env"));

loadIfExists(".env.example", true);
loadIfExists(".env", true);
loadIfExists(".env.local", true);

/**
 * Cursor / some runners inject MONGODB_URI before this file runs; dotenv may not override.
 * Re-apply .env.local (then .env) by parsing files directly so project config always wins.
 */
function forceApplyEnvFile(filename: string) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return;
  const buf = readFileSync(path, "utf8");
  const parsed = parse(buf);
  for (const [key, value] of Object.entries(parsed)) {
    if (value !== undefined) process.env[key] = value;
  }
}

forceApplyEnvFile(".env");
forceApplyEnvFile(".env.local");

if (!hasLocal && !hasEnv && existsSync(resolve(root, ".env.example"))) {
  console.warn(
    "[env] Using .env.example only — create .env.local with a real MONGODB_URI (replace USER:PASSWORD in Atlas string)."
  );
}
