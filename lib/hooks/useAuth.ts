import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { setToken, setUser, logout as logoutAction } from "../store/authSlice";
import { useGetMeQuery } from "../store/api";
import { useEffect } from "react";
import { useDevRole } from "./useDevRole";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { data: meData, error } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (meData) {
      dispatch(setUser(meData));
    }
  }, [meData, dispatch]);

  useEffect(() => {
    if (error && "status" in error && error.status === 401) {
      dispatch(logoutAction());
    }
  }, [error, dispatch]);

  const login = () => {
    const redirect = window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/auth/callback";
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE ?? "/api/v1"}/auth/discord?redirect=${encodeURIComponent(redirect)}`;
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  let isLoggedIn = !!token && !!user;
  let isAdmin = user?.roles.includes("ADMIN") ?? false;
  let isAuthor = isAdmin || (user?.roles.includes("AUTHOR") ?? false);

  const devRole = useDevRole();
  if (process.env.NODE_ENV === "development" && devRole !== "real") {
    switch (devRole) {
      case "admin":
        isLoggedIn = true;
        isAdmin = true;
        isAuthor = true;
        break;
      case "author":
        isLoggedIn = true;
        isAdmin = false;
        isAuthor = true;
        break;
      case "user":
        isLoggedIn = true;
        isAdmin = false;
        isAuthor = false;
        break;
      case "guest":
        isLoggedIn = false;
        isAdmin = false;
        isAuthor = false;
        break;
    }
  }

  return { token, user, isLoggedIn, isAdmin, isAuthor, login, logout, setToken: (t: string) => dispatch(setToken(t)) };
}
