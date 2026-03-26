"use client";

import Link from "next/link";
import { Button } from "@fluentui/react-components";
import {
  PersonRegular,
  ArrowRightRegular,
  EditRegular,
  ShieldKeyholeRegular,
  RocketRegular,
  BookQuestionMarkRegular,
  BugRegular,
  TrophyRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";

const WORKFLOW_STEPS = [
  {
    icon: <EditRegular className="text-lg" />,
    labelKey: "workflowCreate" as const,
    descKey: "workflowCreateDesc" as const,
    color: "bg-blue-500",
  },
  {
    icon: <BugRegular className="text-lg" />,
    labelKey: "workflowTest" as const,
    descKey: "workflowTestDesc" as const,
    color: "bg-violet-500",
  },
  {
    icon: <ShieldKeyholeRegular className="text-lg" />,
    labelKey: "workflowReview" as const,
    descKey: "workflowReviewDesc" as const,
    color: "bg-amber-500",
  },
  {
    icon: <RocketRegular className="text-lg" />,
    labelKey: "workflowPublish" as const,
    descKey: "workflowPublishDesc" as const,
    color: "bg-emerald-500",
  },
];

export default function LandingPage() {
  const { isLoggedIn, isAuthor, login } = useAuth();
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");
  const questsHref = isAuthor ? "/author/quests" : "/quests";

  return (
    <div className="flex flex-col min-h-full py-6">
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Branding & CTA */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                N
              </div>
              <span className="text-sm font-semibold tracking-wide text-gray-400 uppercase">
                NQuest Studio
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              {t("title")}
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("titleHighlight")}
              </span>
            </h1>

            <p className="text-base text-gray-500 max-w-md leading-relaxed">
              {t("description")}
            </p>

            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3 flex-wrap">
                <Link href={questsHref}>
                  <Button
                    appearance="primary"
                    size="large"
                    icon={<ArrowRightRegular />}
                    iconPosition="after"
                  >
                    {t("browseQuests")}
                  </Button>
                </Link>
                <Link href="/ranking">
                  <Button
                    appearance="secondary"
                    size="large"
                    icon={<TrophyRegular />}
                  >
                    {t("leaderboards")}
                  </Button>
                </Link>
              </div>

              {isAuthor && (
                <Link href="/author/guide" className="block">
                  <div className="inline-flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 transition-colors hover:bg-blue-100/60">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <BookQuestionMarkRegular className="text-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">
                        {t("authorGuide")}
                      </p>
                    </div>
                    <ArrowRightRegular className="text-blue-400 ml-1" />
                  </div>
                </Link>
              )}
              {!isLoggedIn && (
                <div className="flex items-center gap-2">
                  <Button
                    appearance="subtle"
                    icon={<PersonRegular />}
                    onClick={login}
                  >
                    {tNav("login")}
                  </Button>
                  <span className="text-sm text-gray-400">{t("loginPrompt")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right — Workflow preview */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="py-4 px-6">
                {WORKFLOW_STEPS.map((step, i) => (
                  <div key={step.labelKey} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center text-white shrink-0`}
                      >
                        {step.icon}
                      </div>
                      {i < WORKFLOW_STEPS.length - 1 && (
                        <div className="w-px h-6 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-semibold text-gray-800">
                        {t(step.labelKey)}
                      </p>
                      <p className="text-sm text-gray-500">{t(step.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-5">
              <p className="text-xs font-bold tracking-wider text-gray-600 mb-2">
                {t("copyright")} <br/>
                {t("copyrightOwner")} Zbx1425
              </p>
              <p className="text-[0.625rem] text-gray-500 leading-relaxed">
                {t("copyrightLicense")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
