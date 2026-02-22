"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
  FluentProvider,
  webLightTheme,
  Spinner,
  RendererProvider,
  createDOMRenderer,
  renderToStyleElements,
} from "@fluentui/react-components";
import { store, persistor } from "@/lib/store";
import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";

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
            <Spinner size="large" label="Loading..." />
          </div>
        }
        persistor={persistor}
      >
        <RendererProvider renderer={renderer}>
          <FluentProvider theme={webLightTheme}>
            {children}
          </FluentProvider>
        </RendererProvider>
      </PersistGate>
    </Provider>
  );
}
