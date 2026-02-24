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
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";

const WORKFLOW_STEPS = [
  {
    icon: <EditRegular className="text-lg" />,
    label: "Create & Edit",
    desc: "Build quests visually with the step editor",
    color: "bg-blue-500",
  },
  {
    icon: <BugRegular className="text-lg" />,
    label: "Test in-Game",
    desc: "Test the quest in-game with debug mode enabled",
    color: "bg-violet-500",
  },
  {
    icon: <ShieldKeyholeRegular className="text-lg" />,
    label: "Review",
    desc: "LPS Staff reviews the quest and approves it for publishing",
    color: "bg-amber-500",
  },
  {
    icon: <RocketRegular className="text-lg" />,
    label: "Publish",
    desc: "Go live for all players on the server",
    color: "bg-emerald-500",
  },
];

export default function LandingPage() {
  const { isLoggedIn, login } = useAuth();

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
              Quest Management
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="text-base text-gray-500 max-w-md leading-relaxed">
            NQuest Studio gives quest authors a visual editor, collaborative access control, and a publishing pipeline.
            </p>

            {isLoggedIn ? (
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-3">
                  <Link href="/author/quests">
                    <Button
                      appearance="primary"
                      size="large"
                      icon={<ArrowRightRegular />}
                      iconPosition="after"
                    >
                      Go to Quests
                    </Button>
                  </Link>
                </div>

                <Link href="/guide" className="block">
                  <div className="inline-flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 transition-colors hover:bg-blue-100/60">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <BookQuestionMarkRegular className="text-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">
                        New here? Read the workflow guide
                      </p>
                    </div>
                    <ArrowRightRegular className="text-blue-400 ml-1" />
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-1">
                <Button
                  appearance="primary"
                  size="large"
                  icon={<PersonRegular />}
                  onClick={login}
                >
                  Login with Discord
                </Button>
              </div>
            )}
          </div>

          {/* Right — Workflow preview */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="py-4 px-6">
                {WORKFLOW_STEPS.map((step, i) => (
                  <div key={step.label} className="flex items-start gap-4">
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
                        {step.label}
                      </p>
                      <p className="text-sm text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5">
              <p className="text-xs font-bold tracking-wider text-gray-600 mb-2">
                ALL RIGHTS RESERVED <br/>
                Copyright (C) 2026-present Zbx1425
              </p>
              <p className="text-[0.625rem] text-gray-500 leading-relaxed">
THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW. EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM “AS IS” WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU. SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING, REPAIR OR CORRECTION. IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED TO LOSS OF DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER PROGRAMS), EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
