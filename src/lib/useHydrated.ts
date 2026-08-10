import { useSyncExternalStore } from "react";
import { useDraftStore } from "./store";

function subscribe(callback: () => void) {
  if (!useDraftStore.persist) return () => {};
  return useDraftStore.persist.onFinishHydration(callback);
}

function getSnapshot() {
  return useDraftStore.persist?.hasHydrated() ?? true;
}

function getServerSnapshot() {
  return false;
}

/** True once the persisted zustand store has finished reading from localStorage. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
