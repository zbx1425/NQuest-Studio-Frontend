"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge, Divider } from "@fluentui/react-components";
import {
  EditRegular,
  PersonRegular,
  EyeRegular,
  ShieldCheckmarkRegular,
  ArrowSyncRegular,
  LinkRegular,
  PlayRegular,
  CheckmarkCircleRegular,
  ArrowRightRegular,
  LockClosedRegular,
  PeopleRegular,
  GlobeRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";

const STATE_CARDS = [
  {
    name: "Private",
    badge: "informative" as const,
    icon: <LockClosedRegular className="text-2xl" />,
    desc: "Only visible to the quest creator. This is the default state for new quests.",
    detail: "Use this stage to draft and iterate without affecting anyone else.",
    bg: "from-blue-50 to-blue-100/50",
    border: "border-blue-200",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    name: "Staging",
    badge: "warning" as const,
    icon: <PeopleRegular className="text-2xl" />,
    desc: "Visible to all builders. Available for collaborative testing and peer review.",
    detail: "Builders can access staging quests in-game with debug mode enabled.",
    bg: "from-amber-50 to-amber-100/50",
    border: "border-amber-200",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    name: "Public",
    badge: "success" as const,
    icon: <GlobeRegular className="text-2xl" />,
    desc: "Live for all players on the server. Only LPS staff can promote to this state.",
    detail: "Once public, updates go through a separate review cycle.",
    bg: "from-emerald-50 to-emerald-100/50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
];

const NEW_QUEST_STEPS = [
  {
    step: 1,
    icon: <EditRegular />,
    title: "Create & Edit Your Quest",
    desc: "Use the visual quest editor to build your quest with steps and criteria. Your quest starts in Private state, visible only to you.",
    color: "bg-blue-500",
  },
  {
    step: 2,
    icon: <PlayRegular />,
    title: "Test In-Game",
    desc: (
      <>
        Join the Minecraft server and use{" "}
        <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
          /nquest debugMode
        </code>{" "}
        to preview your quest. Make sure to link your Minecraft account first
        (see below).
      </>
    ),
    color: "bg-violet-500",
  },
  {
    step: 3,
    icon: <ArrowRightRegular />,
    title: "Promote to Staging",
    desc: "When you are satisfied with your quest, promote it from Private to Staging. This makes it visible to all builders for peer testing. Then ask a staff member to review it.",
    color: "bg-amber-500",
  },
  {
    step: 4,
    icon: <ShieldCheckmarkRegular />,
    title: "Staff Review & Publish",
    desc: "A staff member reviews your quest. Once approved, they promote it from Staging to Public, making it live for all players.",
    color: "bg-emerald-500",
  },
];

const UPDATE_STEPS = [
  {
    step: 5,
    icon: <EditRegular />,
    title: "Edit the Published Quest",
    desc: "Make your changes to the quest steps. The quest will be marked as \"Pending Review\" automatically.",
    color: "bg-blue-500",
  },
  {
    step: 6,
    icon: <EyeRegular />,
    title: "Players Keep the Old Version",
    desc: (
      <>
        While your changes are under review, players continue to see the
        original published version. Builders with debug mode can preview the
        updated version as a separate Staging quest.
      </>
    ),
    color: "bg-amber-500",
  },
  {
    step: 7,
    icon: <CheckmarkCircleRegular />,
    title: "Staff Approves the Update",
    desc: "A staff member reviews your changes. Once approved, they promote the update, seamlessly replacing the old version for all players.",
    color: "bg-emerald-500",
  },
];

function StepTimeline({
  steps,
}: {
  steps: {
    step: number;
    icon: React.ReactNode;
    title: string;
    desc: React.ReactNode;
    color: string;
  }[];
}) {
  return (
    <div className="space-y-0">
      {steps.map((s, i) => (
        <div key={s.step} className="flex gap-4">
          {/* Vertical line & dot */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full ${s.color} flex items-center justify-center text-white shrink-0 text-base shadow-sm`}
            >
              {s.icon}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 min-h-6" />
            )}
          </div>
          {/* Content */}
          <div className="pb-8">
            <p className="text-sm font-bold text-gray-800 leading-9">
              {s.title}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GuidePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
      {/* Page header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Workflow Guide
        </h1>
        <p className="text-base text-gray-500 max-w-2xl">
          NQuest Studio manages the full lifecycle of server quests, from
          drafting to publishing. This guide walks you through how quests move
          from your editor to the live game.
        </p>
      </header>

      <Divider />

      {/* Quest States */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            Quest States
          </h2>
          <p className="text-sm text-gray-500">
            Every quest exists in one of three visibility states. Understanding
            them is key to the publishing workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATE_CARDS.map((s) => (
            <div
              key={s.name}
              className={`rounded-xl border ${s.border} bg-gradient-to-b ${s.bg} p-5 space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center`}
                >
                  {s.icon}
                </div>
                <Badge appearance="filled" color={s.badge} size="medium">
                  {s.name}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-gray-800">{s.desc}</p>
              <p className="text-xs text-gray-500">{s.detail}</p>
            </div>
          ))}
        </div>

        {/* State flow arrow */}
        <div className="flex items-center justify-center gap-3 py-2">
          <Badge appearance="filled" color="informative">
            Private
          </Badge>
          <ArrowRightRegular className="text-gray-400" />
          <Badge appearance="filled" color="warning">
            Staging
          </Badge>
          <ArrowRightRegular className="text-gray-400" />
          <Badge appearance="filled" color="success">
            Public
          </Badge>
          <span className="text-xs text-gray-400 ml-2">
            (Only LPS staff can promote to Public)
          </span>
        </div>
      </section>

      <Divider />

      {/* New Quest Workflow */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            Creating a New Quest
          </h2>
          <p className="text-sm text-gray-500">
            Follow these steps to create, test, and publish a brand-new quest.
          </p>
        </div>
        <StepTimeline steps={NEW_QUEST_STEPS} />
      </section>

      <Divider />

      {/* Updating an Existing Quest */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            Updating a Published Quest
          </h2>
          <p className="text-sm text-gray-500">
            Already-published quests follow a safe update cycle so players are
            never disrupted.
          </p>
        </div>
        <StepTimeline steps={UPDATE_STEPS} />
      </section>

      <Divider />

      {/* Account Linking & Debug */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            Tips & Setup
          </h2>
          <p className="text-sm text-gray-500">
            A few things to set up before you start building quests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
              <LinkRegular className="text-lg" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              Link Your Minecraft Account
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Run{" "}
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                /idtoken
              </code>{" "}
              in-game to get a token, then paste it in{" "}
              <span className="font-medium text-gray-700">Settings</span> to
              connect your Minecraft account. This is required for Private quest
              testing.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
              <PersonRegular className="text-lg" />
            </div>
            <p className="text-sm font-bold text-gray-800">Debug Mode</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Use{" "}
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                /nquest debugMode
              </code>{" "}
              in-game to toggle debug mode. When active, you can see and test
              quests in Private and Staging states without affecting the
              experience for regular players.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2 md:col-span-2">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <ArrowSyncRegular className="text-lg" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              Live Sync with the Server
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              The Minecraft server automatically pulls quest data from NQuest
              Studio. After you save changes in the editor, your quest becomes
              available in-game within moments. No manual file transfers or JSON
              wrangling needed.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
