import * as Crypto from "expo-crypto";

/** Stable cross-device identifier for rows (int PKs stay device-local). */
export function newUuid(): string {
  return Crypto.randomUUID();
}
