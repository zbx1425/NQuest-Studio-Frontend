import { useEffect, useMemo, useReducer } from "react";

interface MinecraftProfile {
  username: string | null;
  avatarUrl: string | null;
  loading: boolean;
}

const profileCache = new Map<string, string>();

type State = { username: string | null; loading: boolean };
type Action =
  | { type: "fetched"; username: string }
  | { type: "done" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "fetched":
      return { username: action.username, loading: false };
    case "done":
      return { ...state, loading: false };
  }
}

function initState(uuid: string | null | undefined): State {
  if (!uuid) return { username: null, loading: false };
  const cached = profileCache.get(uuid);
  if (cached) return { username: cached, loading: false };
  return { username: null, loading: true };
}

export function useMinecraftProfile(uuid: string | null | undefined): MinecraftProfile {
  const [state, dispatch] = useReducer(reducer, uuid, initState);

  useEffect(() => {
    if (!uuid || profileCache.has(uuid)) return;

    let cancelled = false;

    fetch(`https://playerdb.co/api/player/minecraft/${uuid}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && data.data?.player?.username) {
          const name = data.data.player.username as string;
          profileCache.set(uuid, name);
          dispatch({ type: "fetched", username: name });
        } else {
          dispatch({ type: "done" });
        }
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "done" });
      });

    return () => { cancelled = true; };
  }, [uuid]);

  const avatarUrl = useMemo(
    () => (uuid ? `https://vzge.me/face/256/${uuid}` : null),
    [uuid]
  );

  return { username: state.username, avatarUrl, loading: state.loading };
}
