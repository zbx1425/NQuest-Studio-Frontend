import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AppLocale = "en" | "zh-CN" | "zh" | "ja" | "ko";

interface LocaleState {
  locale: AppLocale;
}

function detectDefaultLocale(): AppLocale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  if (lang === "zh-cn" || lang === "zh-hans") return "zh-CN";
  if (lang.startsWith("zh")) return "zh";
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("ko")) return "ko";
  return "en";
}

const initialState: LocaleState = {
  locale: detectDefaultLocale(),
};

export const localeSlice = createSlice({
  name: "locale",
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<AppLocale>) {
      state.locale = action.payload;
    },
  },
});

export const { setLocale } = localeSlice.actions;
export default localeSlice.reducer;
