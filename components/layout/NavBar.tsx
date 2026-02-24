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
  Badge,
  Avatar,
  Tooltip,
  Toaster,
} from "@fluentui/react-components";
import {
  PersonRegular,
  SignOutRegular,
  SettingsRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, isAdmin, isAuthor, login, logout } = useAuth();
  const tabs = [
    { value: "/ranking", label: "Leaderboards" },
    { value: isAuthor ? "/author/quests" : "/quests", label: "Quests" },
    ...(isAdmin
      ? [{ value: "/admin/categories", label: "Categories" }]
      : []),
    ...(isLoggedIn
      ? [{ value: "/settings", label: "Settings" }]
      : []),
    ...(isAuthor
      ? [{ value: "/author/guide", label: "Guide" }]
      : []),
  ];

  const selectedTab =
    tabs.find((t) => pathname === t.value)?.value ??
    (pathname === "/quests" || pathname === "/author/quests"
      ? tabs.find((t) => t.label === "Quests")?.value
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
                          Admin
                        </Badge>
                      )}
                      {!isAdmin && isAuthor && (
                        <Badge appearance="filled" color="brand" size="small" className="ml-1.5">
                          Author
                        </Badge>
                      )}
                    </Button>
                  </Tooltip>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <Link href="/settings" className="no-underline">
                      <MenuItem icon={<SettingsRegular />}>Settings</MenuItem>
                    </Link>
                    <MenuItem icon={<SignOutRegular />} onClick={() => { logout(); router.push("/"); }}>
                      Logout
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
                Login with Discord
              </Button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

