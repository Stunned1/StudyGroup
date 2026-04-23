// AI-GENERATED: Cursor — helpers for local offline development mode when Supabase is unavailable
const DEV_USER_ID = "dev-user";

export function isOfflineDevModeEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_OFFLINE_MODE === "true"
  );
}

export function getOfflineDevUserId(): string {
  return DEV_USER_ID;
}
