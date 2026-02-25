"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@fluentui/react-components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setToken } = useAuth();
  const t = useTranslations("auth");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      router.replace("/");
    }
  }, [searchParams, setToken, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <Spinner size="large" label={t("loggingIn")} />
    </div>
  );
}
