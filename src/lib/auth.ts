import supabase from "./supabase";

// Password hashing is OPTIONAL only if you're NOT using Supabase Auth
// You can keep it for legacy, but it's NOT needed anymore

import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  return `${salt}.${hash}`;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(".");
  const hashedInput = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  return hash === hashedInput;
}