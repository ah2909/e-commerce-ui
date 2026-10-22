"use client";

import { LocationPicker } from "./primitives/location-picker";
import { Field } from "./ui";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Schema } from "@/lib/api/client";
import { addressDataVersion, loadLocations, type Location } from "@/lib/vn-address";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function AddressFields({
  value,
  label = false,
}: {
  value?: Partial<Schema["CustomerAddress"]>;
  label?: boolean;
}) {
  const [manual, setManual] = useState(!!(value?.province || value?.ward || value?.district));
  const [province, setProvince] = useState<Location>();
  const [ward, setWard] = useState<Location>();
  const [manualProvince, setManualProvince] = useState(value?.province || "");
  const [manualWard, setManualWard] = useState(value?.ward || "");
  const [district, setDistrict] = useState(value?.district || "");
  const provinces = useQuery({
    queryKey: ["vn-locations", addressDataVersion, "provinces"],
    queryFn: ({ signal }) => loadLocations(undefined, signal),
    enabled: !manual,
    staleTime: Infinity,
  });
  const wards = useQuery({
    queryKey: ["vn-locations", addressDataVersion, province?.code],
    queryFn: ({ signal }) => loadLocations(province!.code, signal),
    enabled: !manual && !!province,
    staleTime: Infinity,
  });
  function switchToManual() {
    setManualProvince(province?.name || manualProvince);
    setManualWard(ward?.name || manualWard);
    setManual(true);
  }
  const loading = !manual && (provinces.isPending || (!!province && wards.isPending));
  const failed = !manual && (provinces.isError || (!!province && wards.isError));
  return (
    <div className="address-fields">
      <div className="form-grid">
        {label && (
          <Field
            label="Tên địa chỉ"
            name="label"
            value={value?.label || "Nhà riêng"}
            maxLength={80}
            autoComplete="off"
          />
        )}
        <Field
          label="Tên người nhận"
          name="recipient_name"
          value={value?.recipient_name}
          maxLength={160}
          autoComplete="shipping name"
        />
        <Field
          label="Số điện thoại"
          name="phone"
          type="tel"
          value={value?.phone}
          maxLength={20}
          autoComplete="shipping tel"
          inputMode="tel"
        />
      </div>
      <div className="address-location">
        <div className="address-location-heading">
          <strong>Khu vực giao hàng</strong>
          <Button
            variant="link"
            type="button"
            onClick={() => {
              if (!manual) switchToManual();
              else {
                setManual(false);
                setProvince(undefined);
                setWard(undefined);
                setManualProvince("");
                setManualWard("");
                setDistrict("");
              }
            }}
          >
            {manual ? "Chọn địa chỉ mới từ danh sách" : "Nhập thủ công"}
          </Button>
        </div>
        {manual ? (
          <>
            <p className="field-help">
              Nhập theo địa chỉ nhận hàng của bạn. Địa chỉ đã lưu được giữ nguyên.
            </p>
            <div className="form-grid">
              <Label className="field">
                <span>Tỉnh / Thành phố</span>
                <Input
                  name="province"
                  required
                  maxLength={120}
                  autoComplete="shipping address-level1"
                  value={manualProvince}
                  onChange={(event) => setManualProvince(event.target.value)}
                />
              </Label>
              <Label className="field">
                <span>Phường / Xã / Đặc khu</span>
                <Input
                  name="ward"
                  required
                  maxLength={120}
                  autoComplete="shipping address-level2"
                  value={manualWard}
                  onChange={(event) => setManualWard(event.target.value)}
                />
              </Label>
            </div>
          </>
        ) : (
          <div className="form-grid">
            <LocationPicker
              label="Tỉnh / Thành phố"
              name="province"
              options={provinces.data || []}
              value={province}
              onChange={(next) => {
                setProvince(next);
                setWard(undefined);
                setDistrict("");
                setManualProvince("");
                setManualWard("");
              }}
              placeholder="Ví dụ: Ho Chi Minh"
            />
            <LocationPicker
              key={province?.code || "none"}
              label="Phường / Xã / Đặc khu"
              name="ward"
              options={wards.data || []}
              value={ward}
              onChange={setWard}
              disabled={!province}
              placeholder="Tìm phường, xã hoặc đặc khu"
            />
          </div>
        )}
        {loading && (
          <p className="field-help" role="status">
            Đang tải danh sách địa điểm…
          </p>
        )}
        {failed && (
          <Alert asChild>
            <div className="notice" role="alert">
              <p>Chưa tải được danh sách. Bạn có thể thử lại hoặc nhập thủ công.</p>
              <div className="actions">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    if (provinces.isError) void provinces.refetch();
                    if (province && wards.isError) void wards.refetch();
                  }}
                >
                  Thử lại
                </Button>
                <Button variant="outline" type="button" onClick={switchToManual}>
                  Nhập địa chỉ thủ công
                </Button>
              </div>
            </div>
          </Alert>
        )}
      </div>
      <Field
        label="Số nhà, tên đường"
        name="line1"
        value={value?.line1}
        maxLength={240}
        autoComplete="shipping address-line1"
        placeholder="Ví dụ: 12 Nguyễn Huệ, tòa nhà A"
      />
      <Collapsible
        className="address-extra"
        defaultOpen={!!(value?.line2 || value?.district || value?.postal_code)}
      >
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" className="w-full justify-start">
            Thông tin bổ sung (không bắt buộc)
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount className="data-[state=closed]:hidden">
          <div className="form-grid">
            <Field
              label="Tầng, căn hộ hoặc chỉ dẫn giao hàng"
              name="line2"
              value={value?.line2}
              required={false}
              maxLength={240}
              autoComplete="shipping address-line2"
            />
            <Label className="field">
              <span>Quận / Huyện cũ (nếu cần)</span>
              <Input
                name="district"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                maxLength={120}
                autoComplete="off"
              />
            </Label>
            <Field
              label="Mã bưu chính"
              name="postal_code"
              value={value?.postal_code}
              required={false}
              maxLength={20}
              autoComplete="shipping postal-code"
              inputMode="numeric"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
