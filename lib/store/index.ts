import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import systemMapReducer from "./systemMapSlice";
import localeReducer from "./localeSlice";
import { api } from "./api";
import { rankingApi } from "./rankingApi";

const rootReducer = combineReducers({
  auth: authReducer,
  systemMap: systemMapReducer,
  locale: localeReducer,
  [api.reducerPath]: api.reducer,
  [rankingApi.reducerPath]: rankingApi.reducer,
});

const persistConfig = {
  key: "nquest-studio",
  storage,
  whitelist: ["auth", "systemMap", "locale"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware, rankingApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
