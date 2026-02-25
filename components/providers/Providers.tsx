"use client";

import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
  FluentProvider,
  webLightTheme,
  Spinner,
  RendererProvider,
  createDOMRenderer,
  renderToStyleElements,
} from "@fluentui/react-components";
import { NextIntlClientProvider } from "next-intl";
import { store, persistor } from "@/lib/store";
import type { RootState } from "@/lib/store";
import { useServerInsertedHTML } from "next/navigation";
import { useState, useEffect } from "react";
import { loadMessages } from "@/lib/i18n";
import type { AppLocale } from "@/lib/store/localeSlice";

function IntlWrapper({ children }: { children: React.ReactNode }) {
  const locale = useSelector((state: RootState) => state.locale.locale);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);
  const [activeLocale, setActiveLocale] = useState<AppLocale>(locale);

  useEffect(() => {
    let cancelled = false;
    loadMessages(locale).then((m) => {
      if (!cancelled) {
        setMessages(m);
        setActiveLocale(locale);
        document.documentElement.lang = locale;
      }
    });
    return () => { cancelled = true; };
  }, [locale]);

  if (!messages) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={activeLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [renderer] = useState(() => createDOMRenderer());

  useServerInsertedHTML(() => {
    return <>{renderToStyleElements(renderer)}</>;
  });
  
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex h-screen items-center justify-center">
            <Spinner size="large" />
          </div>
        }
        persistor={persistor}
      >
        <RendererProvider renderer={renderer}>
          <FluentProvider theme={webLightTheme}>
            <IntlWrapper>
              {children}
            </IntlWrapper>
          </FluentProvider>
        </RendererProvider>
      </PersistGate>
    </Provider>
  );
}
