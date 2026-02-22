"use client";

import Link from "next/link";
import { Button, Badge } from "@fluentui/react-components";
import {
  EditRegular,
  PersonRegular,
  ShieldKeyholeRegular,
  LayerRegular,
  ArrowRightRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";

const FEATURES = [
  {
    icon: <EditRegular className="text-2xl" />,
    title: "Visual Quest Editor",
    desc: "Build multi-step quests with a recursive criterion editor — no JSON wrangling needed.",
  },
  {
    icon: <ShieldKeyholeRegular className="text-2xl" />,
    title: "Draft & Review Workflow",
    desc: "Edit freely in drafts. Admins review and promote changes to the live server.",
  },
  {
    icon: <LayerRegular className="text-2xl" />,
    title: "Categories & Tiers",
    desc: "Organize quests into categories with customizable difficulty tiers and point values.",
  },
];

export default function LandingPage() {
  const { isLoggedIn, login } = useAuth();

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center space-y-6">
          <Badge appearance="outline" color="brand" size="large">
            Quest Management for Minecraft Transit Railway
          </Badge>

          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Create, Edit &amp; Publish
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Server Quests
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            NQuest Studio gives quest authors a modern visual editor, collaborative access control, and a safe draft-to-live publishing pipeline. Actually this is pure AI slop
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            {isLoggedIn ? (
              <Link href="/quests">
                <Button
                  appearance="primary"
                  size="large"
                  icon={<ArrowRightRegular />}
                  iconPosition="after"
                >
                  Go to Quests
                </Button>
              </Link>
            ) : (
              <Button
                appearance="primary"
                size="large"
                icon={<PersonRegular />}
                onClick={login}
              >
                Login with Discord
              </Button>
            )}
            <Link href="/quests">
              <Button appearance="outline" size="large">
                Browse Quests
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-200 bg-gray-50/60 px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                {f.icon}
              </div>
              <h3 className="font-semibold text-base">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-400">
        NQuest Studio &middot; Built for the Minecraft Transit Railway community
      </footer>
    </div>
  );
}
