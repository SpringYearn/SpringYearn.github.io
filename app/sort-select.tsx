"use client";

import { Select } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { Localized } from "./localized";

export function SortSelect<T extends string>({ id, label, value, options, onChange }: {
  id: string;
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return <Localized>{<div className="lab-sort-field">
    <label htmlFor={id}>{label}</label>
    <Select.Root value={value} onValueChange={key => onChange(key as T)}>
      <Select.Trigger className="sort-select-trigger" id={id} data-sort-key={value}>
        <Select.Value />
        <Select.Icon><ChevronDown aria-hidden="true" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="language-menu sort-select-menu" position="popper" sideOffset={7} align="start">
          <Select.Viewport>
            {(Object.keys(options) as T[]).map(key => (
              <Select.Item className="language-menu-option" key={key} value={key}>
                <Select.ItemText>{options[key]}</Select.ItemText>
                <Select.ItemIndicator><Check aria-hidden="true" /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  </div>}</Localized>;
}
