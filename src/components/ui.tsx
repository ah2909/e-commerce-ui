"use client";

import { useSession } from "./providers";
import { Alert } from "@/components/ui/alert";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, request } from "@/lib/api/client";
import { states } from "@/lib/commerce";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type ComponentProps, type ReactNode } from "react";

function storedKey(key: string): string | null {
  try {
    return key ? sessionStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function saveKey(key: string, value?: string) {
  if (!key) return;
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch {
    return;
  }
}

export function ErrorNotice({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null;
  const problem = error instanceof ApiError ? error.problem : undefined;
  return (
    <Alert asChild variant="destructive">
      <div className="notice danger" role="alert">
        <strong>
          {error instanceof ApiError && error.status === 403
            ? "Bạn không có quyền thực hiện thao tác này."
            : error instanceof ApiError && error.status === 409
              ? "Dữ liệu đã thay đổi. Hãy tải lại và kiểm tra trước khi thử tiếp."
              : error instanceof Error
                ? error.message
                : "Có lỗi xảy ra."}
        </strong>
        {problem?.request_id && <small>Mã yêu cầu: {problem.request_id}</small>}
        {retry && (
          <Button variant="outline" onClick={retry}>
            Thử lại
          </Button>
        )}
      </div>
    </Alert>
  );
}

export function Loading() {
  return (
    <div role="status" className="my-4 space-y-3">
      <Skeleton className="h-4 w-40" />
      <span className="text-muted-foreground">Đang tải…</span>
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <Card className="empty block border-dashed">{children}</Card>;
}
export function Badge({ state }: { state: string }) {
  return (
    <UiBadge
      variant={/failed|expired|cancelled|reconciliation/.test(state) ? "warning" : "secondary"}
    >
      {states[state] || state}
    </UiBadge>
  );
}
export function Field({
  label,
  name,
  type = "text",
  value,
  required = true,
  maxLength,
  min,
  max,
  readOnly = false,
  autoComplete,
  inputMode,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  readOnly?: boolean;
  autoComplete?: string;
  inputMode?: ComponentProps<"input">["inputMode"];
  placeholder?: string;
}) {
  return (
    <Label className="field">
      <span>{label}</span>
      <Input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        step={type === "number" ? 1 : undefined}
        readOnly={readOnly}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
      />
    </Label>
  );
}

export function useAction() {
  const client = useQueryClient();
  const { scope } = useSession();
  const attempts = useRef(new Map<string, string>());
  const busy = useRef(false);
  const lastFailure = useRef<unknown>(undefined);
  const unresolved = useRef<{ path: string; method: string; body: unknown } | undefined>(undefined);
  const [uncertain, setUncertain] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>();
  const [done, setDone] = useState(false);
  async function run<T>(
    path: string,
    method: string,
    body?: unknown,
    idempotent = false,
  ): Promise<T | undefined> {
    if (busy.current) return;
    if (unresolved.current) {
      if (unresolved.current.path !== path || unresolved.current.method !== method) return;
      body = unresolved.current.body;
      idempotent = true;
    }
    busy.current = true;
    setPending(true);
    setError(undefined);
    setDone(false);
    const fingerprint = `${scope.join(":")}:${method}:${path}:${JSON.stringify(body)}`;
    let storageKey = "";
    try {
      const digest =
        idempotent && crypto.subtle
          ? Array.from(
              new Uint8Array(
                await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprint)),
              ),
            )
              .map((byte) => byte.toString(16).padStart(2, "0"))
              .join("")
          : "";
      storageKey = digest ? `commerce-idempotency:${digest}` : "";
      if (idempotent && !attempts.current.has(fingerprint)) {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        attempts.current.set(
          fingerprint,
          storedKey(storageKey) ||
            Array.from(bytes)
              .map((byte) => byte.toString(16).padStart(2, "0"))
              .join(""),
        );
        saveKey(storageKey, attempts.current.get(fingerprint));
      }
      if (idempotent) unresolved.current = { path, method, body: structuredClone(body) };
      const result = await request<T>(
        path,
        method,
        body,
        idempotent ? attempts.current.get(fingerprint) : undefined,
      );
      attempts.current.delete(fingerprint);
      lastFailure.current = undefined;
      unresolved.current = undefined;
      setUncertain(false);
      saveKey(storageKey);
      await client.invalidateQueries({
        predicate: (q) => q.queryKey[0] !== "session",
      });
      setDone(true);
      return result;
    } catch (failure) {
      if (
        failure instanceof ApiError &&
        failure.status >= 400 &&
        failure.status < 500 &&
        ![408, 429].includes(failure.status)
      ) {
        attempts.current.delete(fingerprint);
        saveKey(storageKey);
        unresolved.current = undefined;
        setUncertain(false);
      } else if (idempotent && unresolved.current) setUncertain(true);
      lastFailure.current = failure;
      setError(failure);
      if (failure instanceof ApiError && failure.status === 409) await client.invalidateQueries();
      return undefined;
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  const retry = () =>
    unresolved.current
      ? run(unresolved.current.path, unresolved.current.method, unresolved.current.body, true)
      : Promise.resolve(undefined);
  return {
    run,
    pending: pending || uncertain,
    working: pending,
    uncertain,
    retry,
    error,
    done,
    lastFailure,
  };
}

export function ActionFeedback({
  action,
  onRetry,
}: {
  action: ReturnType<typeof useAction>;
  onRetry?: () => void;
}) {
  return (
    <>
      <ErrorNotice error={action.error} />
      {action.uncertain && (
        <Alert asChild role={undefined}>
          <div className="notice">
            <p>Chưa xác định kết quả. Thử lại yêu cầu đã gửi trước khi thực hiện thao tác khác.</p>
            <Button
              type="button"
              disabled={action.working}
              onClick={onRetry || (() => void action.retry())}
            >
              Thử lại thao tác đã gửi
            </Button>
          </div>
        </Alert>
      )}
      {action.done && (
        <Alert asChild>
          <p className="notice" role="status">
            Đã lưu thay đổi.
          </p>
        </Alert>
      )}
    </>
  );
}
