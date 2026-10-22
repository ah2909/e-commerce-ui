"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Appearance } from "@/lib/appearance";
import type { ReactNode } from "react";

export function PreviewDialog({
  title,
  description,
  theme,
  children,
}: {
  title: string;
  description: string;
  theme: Appearance["preset"];
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Xem toàn màn hình
        </Button>
      </DialogTrigger>
      <DialogContent
        data-theme={theme}
        className="preview-dialog block max-h-[90dvh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto sm:max-w-6xl"
        showCloseButton={false}
      >
        <div className="dialog-heading">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button type="button" variant="outline" aria-label="Đóng bản xem trước">
              Đóng
            </Button>
          </DialogClose>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}
