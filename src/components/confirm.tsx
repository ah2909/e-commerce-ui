"use client";

import { useAppearance } from "@/components/appearance";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Confirm = (description: string) => Promise<boolean>;
const Context = createContext<Confirm | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { preset } = useAppearance();
  const [description, setDescription] = useState<string>();
  const trigger = useRef<HTMLElement | null>(null);
  const resolve = useRef<((accepted: boolean) => void) | undefined>(undefined);
  const confirm = useCallback<Confirm>((message) => {
    if (resolve.current) return Promise.resolve(false);
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDescription(message);
    return new Promise<boolean>((done) => {
      resolve.current = done;
    });
  }, []);
  function finish(accepted: boolean) {
    const done = resolve.current;
    resolve.current = undefined;
    setDescription(undefined);
    done?.(accepted);
  }
  useEffect(
    () => () => {
      resolve.current?.(false);
      resolve.current = undefined;
    },
    [],
  );
  return (
    <Context.Provider value={confirm}>
      {children}
      <AlertDialog
        open={description !== undefined}
        onOpenChange={(open) => {
          if (!open) finish(false);
        }}
      >
        <AlertDialogContent
          data-theme={preset}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (trigger.current?.isConnected) trigger.current.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thao tác</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => finish(false)}>Quay lại</AlertDialogCancel>
            <AlertDialogAction onClick={() => finish(true)}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Context.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(Context);
  if (!confirm) throw new Error("confirm_provider_required");
  return confirm;
}
