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
import { useTranslations } from "next-intl";

const CODE_CLASS = "px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono";

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
  const t = useTranslations("guide");
  const tStatus = useTranslations("status");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const stateCards = [
    {
      key: "private" as const,
      badge: "informative" as const,
      icon: <LockClosedRegular className="text-2xl" />,
      bg: "from-blue-50 to-blue-100/50",
      border: "border-blue-200",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      key: "staging" as const,
      badge: "warning" as const,
      icon: <PeopleRegular className="text-2xl" />,
      bg: "from-amber-50 to-amber-100/50",
      border: "border-amber-200",
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      key: "public" as const,
      badge: "success" as const,
      icon: <GlobeRegular className="text-2xl" />,
      bg: "from-emerald-50 to-emerald-100/50",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-600",
    },
  ];

  const descKeys = {
    private: { desc: "privateDesc", detail: "privateDetail" },
    staging: { desc: "stagingDesc", detail: "stagingDetail" },
    public: { desc: "publicDesc", detail: "publicDetail" },
  } as const;

  const newQuestSteps = [
    {
      step: 1,
      icon: <EditRegular />,
      title: t("step1Title"),
      desc: t("step1Desc"),
      color: "bg-blue-500",
    },
    {
      step: 2,
      icon: <PlayRegular />,
      title: t("step2Title"),
      desc: t.rich("step2Desc", {
        command: (chunks) => <code className={CODE_CLASS}>{chunks}</code>,
      }),
      color: "bg-violet-500",
    },
    {
      step: 3,
      icon: <ArrowRightRegular />,
      title: t("step3Title"),
      desc: t("step3Desc"),
      color: "bg-amber-500",
    },
    {
      step: 4,
      icon: <ShieldCheckmarkRegular />,
      title: t("step4Title"),
      desc: t("step4Desc"),
      color: "bg-emerald-500",
    },
  ];

  const updateSteps = [
    {
      step: 5,
      icon: <EditRegular />,
      title: t("step5Title"),
      desc: t("step5Desc"),
      color: "bg-blue-500",
    },
    {
      step: 6,
      icon: <EyeRegular />,
      title: t("step6Title"),
      desc: t("step6Desc"),
      color: "bg-amber-500",
    },
    {
      step: 7,
      icon: <CheckmarkCircleRegular />,
      title: t("step7Title"),
      desc: t("step7Desc"),
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
      {/* Page header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-base text-gray-500 max-w-2xl">
          {t("description")}
        </p>
      </header>

      <Divider />

      {/* Quest States */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            {t("questStates")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("questStatesDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stateCards.map((s) => (
            <div
              key={s.key}
              className={`rounded-lg border ${s.border} bg-gradient-to-b ${s.bg} p-5 space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center`}
                >
                  {s.icon}
                </div>
                <Badge appearance="filled" color={s.badge} size="medium">
                  {tStatus(s.key)}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {t(descKeys[s.key].desc)}
              </p>
              <p className="text-xs text-gray-500">
                {t(descKeys[s.key].detail)}
              </p>
            </div>
          ))}
        </div>

        {/* State flow arrow */}
        <div className="flex items-center justify-center gap-3 py-2">
          <Badge appearance="filled" color="informative">
            {tStatus("private")}
          </Badge>
          <ArrowRightRegular className="text-gray-400" />
          <Badge appearance="filled" color="warning">
            {tStatus("staging")}
          </Badge>
          <ArrowRightRegular className="text-gray-400" />
          <Badge appearance="filled" color="success">
            {tStatus("public")}
          </Badge>
          <span className="text-xs text-gray-400 ml-2">
            {t("stateFlowNote")}
          </span>
        </div>
      </section>

      <Divider />

      {/* New Quest Workflow */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            {t("creatingNewQuest")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("creatingNewQuestDesc")}
          </p>
        </div>
        <StepTimeline steps={newQuestSteps} />
      </section>

      <Divider />

      {/* Updating an Existing Quest */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            {t("updatingPublishedQuest")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("updatingPublishedQuestDesc")}
          </p>
        </div>
        <StepTimeline steps={updateSteps} />
      </section>

      <Divider />

      {/* Account Linking & Debug */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            {t("tipsSetup")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("tipsSetupDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
              <LinkRegular className="text-lg" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              {t("linkMcTitle")}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t.rich("linkMcDesc", {
                command: (chunks) => <code className={CODE_CLASS}>{chunks}</code>,
                settings: (chunks) => (
                  <span className="font-medium text-gray-700">{chunks}</span>
                ),
              })}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
              <PersonRegular className="text-lg" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              {t("debugModeTitle")}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t.rich("debugModeDesc", {
                command: (chunks) => <code className={CODE_CLASS}>{chunks}</code>,
              })}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-2 md:col-span-2">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <ArrowSyncRegular className="text-lg" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              {t("liveSyncTitle")}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("liveSyncDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
