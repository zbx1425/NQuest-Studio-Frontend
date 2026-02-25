import { useLocale } from "next-intl";
import { enUS, zhCN, zhTW, ja, ko } from "date-fns/locale";

const localeMap: Record<string, typeof enUS> = {
  en: enUS,
  "zh-CN": zhCN,
  zh: zhTW,
  ja,
  ko,
};

export function useDateLocale() {
  const locale = useLocale();
  return localeMap[locale] ?? enUS;
}
