"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <Card className="empty block border-dashed">
      <h1>Không thể tải trang</h1>
      <p>Vui lòng thử lại.</p>
      <Button onClick={reset}>Thử lại</Button>
    </Card>
  );
}
