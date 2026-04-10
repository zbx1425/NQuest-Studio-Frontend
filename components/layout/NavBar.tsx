"use client";

import { useState } from "react";
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
  NavigationRegular,
  DismissRegular,
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
  ko: "한국어",
};

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isLoggedIn, isAdmin, isAuthor, login, logout } = useAuth();
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const currentLocale = useSelector(
    (state: RootState) => state.locale.locale
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminMenuItems = [
    { value: "/admin/categories", label: "Categories" },
    { value: "/admin/user", label: "Players" },
    { value: "/admin/audit", label: "Audit Log" },
  ];

  const tabs = [
    { value: "/ranking", label: t("leaderboards") },
    {
      value: isAuthor ? "/author/quests" : "/quests",
      label: t("quests"),
    },
    ...(isLoggedIn
      ? [{ value: "/settings", label: t("settings") }]
      : []),
    ...(isAuthor
      ? [{ value: "/author/guide", label: t("guide") }]
      : []),
  ];

  const questsTab = tabs.find(
    (tab) => tab.value === "/quests" || tab.value === "/author/quests"
  );
  const selectedTab =
    tabs.find((tab) => pathname === tab.value)?.value ??
    (pathname === "/quests" || pathname === "/author/quests"
      ? questsTab?.value
      : "") ??
    "";

  return (
    <>
      <Toaster toasterId="global-toaster" position="top-end" />
      <nav className="w-full border-b border-gray-200 shrink-0 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <Link
            href="/"
            className="text-lg font-bold mr-6 no-underline text-inherit shrink-0"
          >
            NQuest Studio
          </Link>

          {/* Desktop tabs */}
          <TabList
            selectedValue={selectedTab}
            className="flex-1 !hidden md:!flex"
          >
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={tab.value}
                className="no-underline"
              >
                <Tab value={tab.value}>{tab.label}</Tab>
              </Link>
            ))}
            {isAdmin && (
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Tab value="admin">{tc("admin")}</Tab>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    {adminMenuItems.map((item) => (
                      <Link
                        key={item.value}
                        href={item.value}
                        className="no-underline"
                      >
                        <MenuItem>{item.label}</MenuItem>
                      </Link>
                    ))}
                  </MenuList>
                </MenuPopover>
              </Menu>
            )}
          </TabList>

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language picker */}
            <Menu
              checkedValues={{ locale: [currentLocale] }}
              onCheckedValueChange={(_, data) => {
                const val = data.checkedItems[0] as AppLocale;
                if (val) dispatch(setLocale(val));
              }}
            >
              <MenuTrigger disableButtonEnhancement>
                <Tooltip
                  content={LOCALE_LABELS[currentLocale]}
                  relationship="label"
                >
                  <Button
                    appearance="subtle"
                    icon={<LocalLanguageRegular />}
                    size="small"
                  />
                </Tooltip>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {(
                    Object.entries(LOCALE_LABELS) as [AppLocale, string][]
                  ).map(([locale, label]) => (
                    <MenuItemRadio
                      key={locale}
                      name="locale"
                      value={locale}
                    >
                      {label}
                    </MenuItemRadio>
                  ))}
                </MenuList>
              </MenuPopover>
            </Menu>

            {/* User menu / Login */}
            {isLoggedIn && user ? (
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Tooltip content={user.username} relationship="label">
                    <Button
                      appearance="subtle"
                      icon={<Avatar name={user.username} size={24} />}
                    >
                      <span className="hidden sm:inline">
                        {user.username}
                      </span>
                      {isAdmin && (
                        <Badge
                          appearance="filled"
                          color="danger"
                          size="small"
                          className="ml-1.5 hidden sm:inline-flex"
                        >
                          {tc("admin")}
                        </Badge>
                      )}
                      {!isAdmin && isAuthor && (
                        <Badge
                          appearance="filled"
                          color="brand"
                          size="small"
                          className="ml-1.5 hidden sm:inline-flex"
                        >
                          {tc("author")}
                        </Badge>
                      )}
                    </Button>
                  </Tooltip>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <Link href="/settings" className="no-underline">
                      <MenuItem icon={<SettingsRegular />}>
                        {t("settings")}
                      </MenuItem>
                    </Link>
                    <MenuItem
                      icon={<SignOutRegular />}
                      onClick={() => {
                        logout();
                        router.push("/");
                      }}
                    >
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
                <span className="hidden sm:inline">{t("login")}</span>
              </Button>
            )}

            {/* Mobile hamburger */}
            <Button
              appearance="subtle"
              icon={
                mobileOpen ? <DismissRegular /> : <NavigationRegular />
              }
              onClick={() => setMobileOpen((v) => !v)}
              className="md:!hidden"
            />
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white pb-2">
            <div className="px-4 py-1 space-y-0.5">
              {tabs.map((tab) => (
                <Link
                  key={tab.value}
                  href={tab.value}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm no-underline transition-colors ${
                    selectedTab === tab.value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <div className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {tc("admin")}
                  </div>
                  {adminMenuItems.map((item) => (
                    <Link
                      key={item.value}
                      href={item.value}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2.5 rounded-lg text-sm no-underline transition-colors ${
                        pathname === item.value
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
