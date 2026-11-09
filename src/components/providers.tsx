"use client";

import { request } from "@/lib/api/client";
import { ErrorNotice } from "@/components/ui";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Session = { kind: "anonymous" | "user" | "guest"; session: string | null };
type Scope = {
  session: Session;
  scope: readonly string[];
  changeSession: () => Promise<void>;
  ready: boolean;
};
const SessionContext = createContext<Scope | null>(null);

function SessionProvider({ children, client }: { children: ReactNode; client: QueryClient }) {
  const host = useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => "",
  );
  const query = useQuery({
    queryKey: ["session", host],
    queryFn: () => request<Session>("/api/session"),
    enabled: !!host,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const session = query.data || { kind: "anonymous", session: null };
  const identity = `${host}:${session.session || "anonymous"}`;
  useEffect(() => {
    const listener = () => {
      client.clear();
      void query.refetch();
    };
    window.addEventListener("commerce-session-change", listener);
    return () => window.removeEventListener("commerce-session-change", listener);
  }, [client, query]);
  async function changeSession() {
    await client.cancelQueries();
    client.clear();
    try {
      for (let index = sessionStorage.length - 1; index >= 0; index--) {
        const key = sessionStorage.key(index);
        if (key?.startsWith("commerce-idempotency:")) sessionStorage.removeItem(key);
      }
    } catch {
      /* storage may be disabled */
    }
    await query.refetch();
  }
  if (query.isError)
    return (
      <main className="commerce-container">
        <h1>Chưa thể mở cửa hàng</h1>
        <ErrorNotice error={query.error} retry={() => void query.refetch()} />
      </main>
    );
  return (
    <SessionContext.Provider
      value={{
        session,
        scope: [host, session.session || "anonymous"],
        changeSession,
        ready: query.isSuccess,
      }}
    >
      <div key={identity}>{children}</div>
    </SessionContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 30_000, gcTime: 5 * 60_000 },
          mutations: { retry: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <SessionProvider client={client}>{children}</SessionProvider>
    </QueryClientProvider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("session_provider_required");
  return value;
}
