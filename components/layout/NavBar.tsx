"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Tab,
  TabList,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuItemRadio,
  Badge,
  Avatar,
  Tooltip,
  Toaster,
} from "@fluentui/react-components";
import {
  PersonRegular,
  SignOutRegular,
  SettingsRegular,
  LocalLanguageRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/store";
import { setLocale, type AppLocale } from "@/lib/store/localeSlice";

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  "zh-CN": "简体中文",
  zh: "繁體中文",
  ja: "日本語",
};

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isLoggedIn, isAdmin, isAuthor, login, logout } = useAuth();
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const currentLocale = useSelector((state: RootState) => state.locale.locale);
  const tabs = [
    { value: "/ranking", label: t("leaderboards") },
    { value: isAuthor ? "/author/quests" : "/quests", label: t("quests") },
    ...(isAdmin
      ? [{ value: "/admin/categories", label: t("categories") }]
      : []),
    ...(isLoggedIn
      ? [{ value: "/settings", label: t("settings") }]
      : []),
    ...(isAuthor
      ? [{ value: "/author/guide", label: t("guide") }]
      : []),
  ];

  const questsTab = tabs.find((tab) => tab.value === "/quests" || tab.value === "/author/quests");
  const selectedTab =
    tabs.find((tab) => pathname === tab.value)?.value ??
    (pathname === "/quests" || pathname === "/author/quests"
      ? questsTab?.value
      : "") ??
    "";

  return (
    <>
      <Toaster toasterId="global-toaster" position="top-end" />
      <nav className="w-full border-b border-gray-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <Link href="/" className="text-lg font-bold mr-6 no-underline text-inherit">
            NQuest Studio
          </Link>

          <TabList
            selectedValue={selectedTab}
            className="flex-1"
          >
            {tabs.map((tab) => (
              <Link key={tab.value} href={tab.value} className="no-underline">
                <Tab value={tab.value}>{tab.label}</Tab>
              </Link>
            ))}
          </TabList>

          <div className="flex items-center gap-2 ml-auto">
            <Menu
              checkedValues={{ locale: [currentLocale] }}
              onCheckedValueChange={(_, data) => {
                const val = data.checkedItems[0] as AppLocale;
                if (val) dispatch(setLocale(val));
              }}
            >
              <MenuTrigger disableButtonEnhancement>
                <Tooltip content={LOCALE_LABELS[currentLocale]} relationship="label">
                  <Button
                    appearance="subtle"
                    icon={<LocalLanguageRegular />}
                    size="small"
                  />
                </Tooltip>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {(Object.entries(LOCALE_LABELS) as [AppLocale, string][]).map(
                    ([locale, label]) => (
                      <MenuItemRadio key={locale} name="locale" value={locale}>
                        {label}
                      </MenuItemRadio>
                    )
                  )}
                </MenuList>
              </MenuPopover>
            </Menu>

            {isLoggedIn && user ? (
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Tooltip content={user.username} relationship="label">
                    <Button
                      appearance="subtle"
                      icon={<Avatar name={user.username} size={24} />}
                    >
                      {user.username}
                      {isAdmin && (
                        <Badge appearance="filled" color="danger" size="small" className="ml-1.5">
                          {tc("admin")}
                        </Badge>
                      )}
                      {!isAdmin && isAuthor && (
                        <Badge appearance="filled" color="brand" size="small" className="ml-1.5">
                          {tc("author")}
                        </Badge>
                      )}
                    </Button>
                  </Tooltip>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <Link href="/settings" className="no-underline">
                      <MenuItem icon={<SettingsRegular />}>{t("settings")}</MenuItem>
                    </Link>
                    <MenuItem icon={<SignOutRegular />} onClick={() => { logout(); router.push("/"); }}>
                      {t("logout")}
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            ) : (
              <Button
                appearance="primary"
                icon={<PersonRegular />}
                onClick={login}
              >
                {t("login")}
              </Button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

