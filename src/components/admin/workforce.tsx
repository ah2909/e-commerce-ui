"use client";

import { useSession } from "@/components/providers";
import {
  ActionFeedback,
  Badge,
  Empty,
  ErrorNotice,
  Field,
  Loading,
  useAction,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { api, unwrap, type Schema } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export function WorkforceView() {
  const { scope, ready } = useSession();
  const action = useAction();
  const query = useQuery({
    queryKey: [...scope, "memberships"],
    enabled: ready,
    queryFn: async () => unwrap(await api.GET("/api/v1/memberships")),
  });
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorNotice error={query.error} retry={() => void query.refetch()} />;
  return (
    <>
      <span className="eyebrow">NHÂN SỰ</span>
      <h1>Thành viên cửa hàng</h1>
      <ActionFeedback action={action} />
      <Card asChild>
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void action.run("/api/v1/memberships", "POST", {
              user_id: String(form.get("user_id")),
              role: form.get("role"),
            });
          }}
        >
          <h2>Thêm thành viên</h2>
          <p>Người dùng cần có tài khoản tại cửa hàng này.</p>
          <Field label="Mã người dùng" name="user_id" />
          <Label className="field">
            <span>Vai trò</span>
            <NativeSelect name="role">
              <NativeSelectOption value="staff">Nhân viên</NativeSelectOption>
              <NativeSelectOption value="admin">Quản trị viên</NativeSelectOption>
            </NativeSelect>
          </Label>
          <Button disabled={action.pending}>Thêm thành viên</Button>
        </form>
      </Card>
      {!query.data.memberships.length ? (
        <Empty>Chưa có thành viên.</Empty>
      ) : (
        <div className="stack">
          {query.data.memberships.map((membership) => (
            <MembershipEditor key={membership.user_id} membership={membership} />
          ))}
        </div>
      )}
    </>
  );
}

function MembershipEditor({ membership }: { membership: Schema["Membership"] }) {
  const action = useAction();
  return (
    <Card key={`${membership.user_id}:${membership.status}:${membership.role}`} asChild>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          void action.run(`/api/v1/memberships/${membership.user_id}`, "PATCH", {
            role: form.get("role"),
            status: form.get("status"),
          });
        }}
      >
        <h2>
          <small>{membership.user_id}</small>
        </h2>
        <Badge state={membership.status} />
        <div className="form-grid">
          <Label className="field">
            <span>Vai trò</span>
            <NativeSelect name="role" defaultValue={membership.role}>
              <NativeSelectOption value="owner">Chủ cửa hàng</NativeSelectOption>
              <NativeSelectOption value="admin">Quản trị viên</NativeSelectOption>
              <NativeSelectOption value="staff">Nhân viên</NativeSelectOption>
            </NativeSelect>
          </Label>
          <Label className="field">
            <span>Trạng thái</span>
            <NativeSelect name="status" defaultValue={membership.status}>
              <NativeSelectOption value="active">Đang hoạt động</NativeSelectOption>
              <NativeSelectOption value="disabled">Ngừng hoạt động</NativeSelectOption>
            </NativeSelect>
          </Label>
        </div>
        <Button disabled={action.pending}>Cập nhật</Button>
        <ActionFeedback action={action} />
      </form>
    </Card>
  );
}
