"use client";

import { useAppearance } from "@/components/appearance";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { searchText, type Location } from "@/lib/vn-address";
import { Check, ChevronsUpDown } from "lucide-react";
import { useId, useState } from "react";

export function LocationPicker({
  label,
  name,
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
}: {
  label: string;
  name: string;
  options: Location[];
  value?: Location;
  onChange: (value?: Location) => void;
  disabled?: boolean;
  placeholder: string;
}) {
  const id = useId();
  const { preset } = useAppearance();
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const sorted = [...options].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return (
    <div className="location-picker">
      <div className="field">
        <Label htmlFor={id}>{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-invalid={invalid || undefined}
              aria-controls={`${id}-list`}
              aria-describedby={`${id}-help`}
              disabled={disabled}
              className="w-full justify-between border-input bg-card text-left font-normal text-foreground"
            >
              <span className={value ? "" : "text-muted-foreground"}>
                {value?.name || placeholder}
              </span>
              <ChevronsUpDown className="shrink-0 opacity-50" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            data-theme={preset}
            align="start"
            className="w-[var(--radix-popover-trigger-width)] p-0"
          >
            <Command
              filter={(code, query) => {
                const option = options.find((item) => item.code === code);
                return option &&
                  searchText(query)
                    .split(" ")
                    .filter(Boolean)
                    .every((term) => searchText(option.name).includes(term))
                  ? 1
                  : 0;
              }}
            >
              <CommandInput placeholder={placeholder} aria-label={label} />
              <CommandList id={`${id}-list`}>
                <CommandEmpty>
                  Không tìm thấy địa điểm. Bạn có thể nhập địa chỉ thủ công.
                </CommandEmpty>
                <CommandGroup>
                  {sorted.map((item) => (
                    <CommandItem
                      key={item.code}
                      value={item.code}
                      onSelect={() => {
                        onChange(item);
                        setInvalid(false);
                        setOpen(false);
                      }}
                      className="min-h-11"
                    >
                      <span>{item.name}</span>
                      {value?.code === item.code && (
                        <Check className="ml-auto" aria-hidden="true" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <select
          name={name}
          value={value?.name || ""}
          onChange={() => {}}
          required
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          onInvalid={(event) => {
            event.preventDefault();
            setInvalid(true);
            document.getElementById(id)?.focus();
            setOpen(true);
          }}
        >
          <option value="" />
          {value && <option value={value.name}>{value.name}</option>}
        </select>
      </div>
      <small id={`${id}-help`} className="field-help">
        {invalid
          ? "Vui lòng chọn một địa điểm từ danh sách."
          : disabled
            ? "Chọn tỉnh / thành phố trước."
            : "Gõ có dấu hoặc không dấu, rồi chọn trong danh sách."}
      </small>
    </div>
  );
}
