import type { AppLocale } from "./store/localeSlice";

const messageImports: Record<AppLocale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("@/messages/en.json"),
  "zh-CN": () => import("@/messages/zh-CN.json"),
  zh: () => import("@/messages/zh.json"),
  ja: () => import("@/messages/ja.json"),
  ko: () => import("@/messages/ko.json"),
};

const cache = new Map<AppLocale, Record<string, unknown>>();

export async function loadMessages(locale: AppLocale): Promise<Record<string, unknown>> {
  if (cache.has(locale)) return cache.get(locale)!;
  const mod = await messageImports[locale]();
  const messages = mod.default;
  cache.set(locale, messages);
  return messages;
}
