"use client";

import Link from "next/link";
import { Button } from "@fluentui/react-components";
import {
  PersonRegular,
  ArrowRightRegular,
  BookQuestionMarkRegular,
  TrophyRegular,
  SearchRegular,
  EditRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";

const FEATURES = [
  {
    titleKey: "featureExploreTitle" as const,
    descKey: "featureExploreDesc" as const,
    icon: SearchRegular,
    accentBorder: "border-t-blue-500",
    iconBg: "bg-blue-50 text-blue-600",
    hoverShadow: "hover:shadow-blue-500/5",
    span: "sm:col-span-2",
    decoration: "catalog",
  },
  {
    titleKey: "featureCompeteTitle" as const,
    descKey: "featureCompeteDesc" as const,
    icon: TrophyRegular,
    accentBorder: "border-t-amber-500",
    iconBg: "bg-amber-50 text-amber-600",
    hoverShadow: "hover:shadow-amber-500/5",
    span: "",
    decoration: "chart",
  },
  {
    titleKey: "featureCreateTitle" as const,
    descKey: "featureCreateDesc" as const,
    icon: EditRegular,
    accentBorder: "border-t-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    hoverShadow: "hover:shadow-emerald-500/5",
    span: "",
    decoration: "flow",
  },
];

function TransitLinesBg() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {/* Red line — main horizontal sweep */}
      <path
        d="M-60 140 C220 140, 380 340, 620 270 C860 200, 1060 90, 1500 230"
        stroke="#b42249"
        strokeWidth="2"
        opacity="0.07"
        strokeLinecap="round"
      />
      <circle cx="620" cy="270" r="5" fill="#b42249" opacity="0.09" />
      <circle cx="1060" cy="120" r="4" fill="#b42249" opacity="0.07" />

      {/* Blue line — lower horizontal sweep */}
      <path
        d="M-60 540 C240 520, 440 370, 710 430 C980 490, 1120 400, 1500 450"
        stroke="#009FD8"
        strokeWidth="2"
        opacity="0.06"
        strokeLinecap="round"
      />
      <circle cx="710" cy="430" r="4.5" fill="#009FD8" opacity="0.08" />
      <circle cx="1120" cy="410" r="3.5" fill="#009FD8" opacity="0.06" />

      {/* Green line — vertical diagonal */}
      <path
        d="M380 -60 C400 160, 490 360, 560 560 C630 760, 670 860, 700 960"
        stroke="#00A651"
        strokeWidth="1.5"
        opacity="0.05"
        strokeLinecap="round"
      />
      <circle cx="487" cy="360" r="4" fill="#00A651" opacity="0.07" />

      {/* Amber line — vertical diagonal right side */}
      <path
        d="M940 -60 C920 180, 850 380, 800 560 C750 720, 730 840, 710 960"
        stroke="#F59E0B"
        strokeWidth="1.5"
        opacity="0.04"
        strokeLinecap="round"
      />
      <circle cx="850" cy="380" r="3.5" fill="#F59E0B" opacity="0.06" />

      {/* Interchange ring where red & green approach */}
      <circle
        cx="540"
        cy="310"
        r="9"
        stroke="#CBD5E1"
        strokeWidth="1.5"
        fill="none"
        opacity="0.1"
      />
      <circle
        cx="540"
        cy="310"
        r="4"
        stroke="#CBD5E1"
        strokeWidth="1"
        fill="none"
        opacity="0.08"
      />
    </svg>
  );
}

function CatalogDecoration() {
  return (
    <div className="hidden sm:grid grid-cols-3 gap-1.5 shrink-0 opacity-50 group-hover:opacity-90 transition-opacity duration-300">
      <div className="w-7 h-5 rounded bg-blue-200/80" />
      <div className="w-7 h-5 rounded bg-amber-200/80" />
      <div className="w-7 h-5 rounded bg-emerald-200/80" />
      <div className="w-7 h-5 rounded bg-slate-200/80" />
      <div className="w-7 h-5 rounded bg-rose-200/80" />
      <div className="w-7 h-5 rounded bg-cyan-200/80" />
    </div>
  );
}

function ChartDecoration() {
  return (
    <div className="flex items-end gap-1 h-7 opacity-35 group-hover:opacity-70 transition-opacity duration-300">
      <div className="w-2 rounded-t-sm h-2 bg-amber-300" />
      <div className="w-2 rounded-t-sm h-4 bg-amber-400" />
      <div className="w-2 rounded-t-sm h-7 bg-amber-500" />
      <div className="w-2 rounded-t-sm h-5 bg-amber-400" />
      <div className="w-2 rounded-t-sm h-3 bg-amber-300" />
      <div className="w-2 rounded-t-sm h-4 bg-amber-200" />
    </div>
  );
}

function FlowDecoration() {
  return (
    <div className="flex items-center gap-1 opacity-35 group-hover:opacity-70 transition-opacity duration-300">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="contents">
          <div className={`w-2 h-2 rounded-full ${i === 3 ? "bg-emerald-500" : "bg-emerald-400"}`} />
          {i < 3 && <div className="w-4 h-px bg-emerald-300" />}
        </div>
      ))}
    </div>
  );
}

const DECORATIONS: Record<string, () => React.JSX.Element> = {
  catalog: CatalogDecoration,
  chart: ChartDecoration,
  flow: FlowDecoration,
};

export default function LandingPage() {
  const { isLoggedIn, isAuthor, login } = useAuth();
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");
  const questsHref = isAuthor ? "/author/quests" : "/quests";

  return (
    <div className="relative flex flex-col min-h-full overflow-hidden">
      {/* Warm ambient glow */}
      <div className="pointer-events-none absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-mtr/[0.04] blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-300/[0.035] blur-[120px]" />

      {/* Transit-line SVG background */}
      <TransitLinesBg />

      {/* Content */}
      <div className="relative flex-1 flex items-center justify-center px-6 py-14 lg:py-0">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Left — Branding & CTA */}
          <div className="space-y-7 animate-fade-in-up">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg border-2 border-mtr flex items-center justify-center text-mtr text-sm font-bold">
                N
              </div>
              <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                NQuest Studio
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] text-slate-900">
              {t("title")}
              <br />
              <span className="text-mtr">{t("titleHighlight")}</span>
            </h1>

            <p className="text-[0.95rem] text-slate-500 max-w-[26rem] leading-relaxed">
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
                    <p className="text-sm font-semibold text-blue-700">
                      {t("authorGuide")}
                    </p>
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
                  <span className="text-sm text-slate-400">
                    {t("loginPrompt")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right — Feature showcase & Copyright */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon;
                const Decoration = DECORATIONS[feat.decoration];
                const isCatalog = feat.decoration === "catalog";

                return (
                  <div
                    key={feat.titleKey}
                    className={`${feat.span} group rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-sm border-t-[3px] ${feat.accentBorder} p-5 transition-all duration-200 hover:shadow-lg ${feat.hoverShadow} hover:-translate-y-0.5 animate-fade-in-up`}
                    style={{ animationDelay: `${150 + i * 120}ms` }}
                  >
                    {isCatalog ? (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <div className={`w-8 h-8 rounded-lg ${feat.iconBg} flex items-center justify-center shrink-0`}>
                              <Icon className="text-base" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800">
                              {t(feat.titleKey)}
                            </h3>
                          </div>
                          <p className="text-[0.8125rem] text-slate-500 leading-relaxed">
                            {t(feat.descKey)}
                          </p>
                        </div>
                        <Decoration />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className={`w-8 h-8 rounded-lg ${feat.iconBg} flex items-center justify-center shrink-0`}>
                            <Icon className="text-base" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">
                            {t(feat.titleKey)}
                          </h3>
                        </div>
                        <p className="text-[0.8125rem] text-slate-500 leading-relaxed mb-4">
                          {t(feat.descKey)}
                        </p>
                        <Decoration />
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Copyright & License */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 backdrop-blur-sm p-5 animate-fade-in-up [animation-delay:550ms]">
              <p className="text-xs font-bold tracking-wider text-slate-600 mb-2">
                {t("copyright")}
                <br />
                {t("copyrightOwner")} Zbx1425
              </p>
              <p className="text-[0.625rem] text-slate-500 leading-relaxed">
                {t("copyrightLicense")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
