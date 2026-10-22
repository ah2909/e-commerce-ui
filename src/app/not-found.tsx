import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
export default function NotFound() {
  return (
    <Card className="empty block border-dashed">
      <h1>Không tìm thấy trang</h1>
      <Button asChild>
        <Link className="button" href="/">
          Về trang chủ
        </Link>
      </Button>
    </Card>
  );
}
