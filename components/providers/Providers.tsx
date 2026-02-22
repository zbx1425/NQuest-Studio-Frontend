"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
  FluentProvider,
  webLightTheme,
  Spinner,
} from "@fluentui/react-components";
import { store, persistor } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex h-screen items-center justify-center">
            <Spinner size="large" label="Loading..." />
          </div>
        }
        persistor={persistor}
      >
        <FluentProvider theme={webLightTheme} className="min-h-screen">
          {children}
        </FluentProvider>
      </PersistGate>
    </Provider>
  );
}
