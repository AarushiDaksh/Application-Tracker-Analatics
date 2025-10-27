import { cookies } from "next/headers";
import { Types } from "mongoose";

export const AUTH_COOKIE = "eraah_uid";

// Works in App Router route handlers. Param optional on purpose.
export async function getUserId(_req?: Request): Promise<string> {
  const bagOrPromise = cookies() as any;
  const bag = typeof bagOrPromise?.then === "function" ? await bagOrPromise : bagOrPromise;
  const uid: string | undefined = bag?.get?.(AUTH_COOKIE)?.value;
  if (!uid || !Types.ObjectId.isValid(uid)) throw new Error("Unauthorized");
  return uid;
}
