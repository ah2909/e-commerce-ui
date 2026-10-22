"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "./providers";
import { api, unwrap } from "@/lib/api/client";

export function useStoreAccess() {
  const { scope, ready, session } = useSession();
  const query = useQuery({
    queryKey: [...scope, "store"],
    enabled: ready && session.kind === "user",
    queryFn: async () => unwrap(await api.GET("/api/v1/store")),
  });
  return {
    ...query,
    canManage:
      session.kind === "user" &&
      query.isSuccess &&
      ["owner", "admin", "staff"].includes(query.data.role),
  };
}
