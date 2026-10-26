import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { RefObject } from "react";
import type { ViewInstance } from "react-native";
import { captureRef } from "react-native-view-shot";
import { CAPTURE_SIZE } from "./share-card";

/**
 * The only importer of react-native-view-shot. Captures the mounted card to a
 * temp PNG, hands it to the share sheet, and always removes the file —
 * shareAsync resolves on dismiss whether or not anything was posted.
 */
export async function shareCardImage(ref: RefObject<ViewInstance | null>): Promise<void> {
  if (!ref.current) throw new Error("card not mounted");
  const uri = await captureRef(ref, { ...CAPTURE_SIZE, format: "png", result: "tmpfile" });
  try {
    if (!(await Sharing.isAvailableAsync())) throw new Error("sharing unavailable");
    await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png" });
  } finally {
    try {
      new File(uri).delete();
    } catch (error) {
      console.warn("[share-card/cleanup] temp file not removed", error);
    }
  }
}
