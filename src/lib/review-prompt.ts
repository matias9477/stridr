import * as StoreReview from "expo-store-review";
import { Linking, Platform } from "react-native";

/** TODO: set after the first App Store release (numeric id from App Store Connect). */
const APP_STORE_ID = "";

const WRITE_REVIEW_URL = `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;

/**
 * Apple grants ~3 review prompts per 365 days — spend them on emotionally
 * loaded wins ("happy moments": a milestone reached, the Nth item created,
 * a workflow completed), never on app launch. Additionally capped to one
 * attempt per session so a launch with several happy moments doesn't spam.
 */
let promptedThisSession = false;

/** Call right after a happy moment. Silently no-ops when unavailable or already prompted. */
export async function maybeRequestReview(): Promise<void> {
  if (promptedThisSession) return;
  try {
    if (!(await StoreReview.isAvailableAsync())) return;
    promptedThisSession = true;
    await StoreReview.requestReview();
  } catch (error) {
    console.warn("[lib/review-prompt] requestReview failed", error);
  }
}

/**
 * User-initiated (the Settings "Leave a review" row) — ignores the session cap
 * because the user explicitly asked. Falls back to the App Store write-review
 * page when the in-app modal is unavailable, so the tap always leads somewhere.
 */
export async function requestReviewExplicitly(): Promise<void> {
  try {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
      return;
    }
  } catch (error) {
    console.warn("[lib/review-prompt] explicit requestReview failed", error);
  }
  if (Platform.OS === "ios" && APP_STORE_ID) {
    await Linking.openURL(WRITE_REVIEW_URL).catch((error) => {
      console.warn("[lib/review-prompt] could not open App Store review page", error);
    });
  }
}
