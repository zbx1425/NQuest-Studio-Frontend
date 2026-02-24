import { useSyncExternalStore } from "react";

export type DevRole = "real" | "admin" | "author" | "user" | "guest";

const KEY = "nquest-dev-role-override";
const EVENT = "dev-role-change";

function getSnapshot(): DevRole {
  if (typeof window === "undefined") return "real";
  return (sessionStorage.getItem(KEY) as DevRole) ?? "real";
}

function getServerSnapshot(): DevRole {
  return "real";
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function setDevRole(role: DevRole) {
  sessionStorage.setItem(KEY, role);
  window.dispatchEvent(new Event(EVENT));
}

export function useDevRole(): DevRole {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
