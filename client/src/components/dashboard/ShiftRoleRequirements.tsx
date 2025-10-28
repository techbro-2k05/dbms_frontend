import React from "react";
import { useFieldArray, Controller, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Minus, Plus, Trash2 } from "lucide-react";
import ShiftSelect from "./ShiftSelect";
import { ROLE_OPTIONS } from "./shift-constants";

export default function ShiftRoleRequirements({ control, name }: { control: any; name: string }) {
  const { fields, append, remove, update } = useFieldArray({ control, name });
  const rows = useWatch({ control, name }) || [];
  const usedRoleIds = (rows || []).map((r: any) => r?.roleId).filter(Boolean) as number[];
  const availableRoleOptions = ROLE_OPTIONS.filter((o) => !usedRoleIds.includes(o.value));

  const handleCountChange = (index: number, delta: number) => {
    const current = Number(rows?.[index]?.count ?? 0);
    const newCount = Math.max(0, current + delta);
    const roleId = Number(rows?.[index]?.roleId ?? 0);
    update(index, { roleId, count: newCount });
  };

  const handleAppend = () => {
    if (fields.length >= ROLE_OPTIONS.length) return;
    const newRoleId = availableRoleOptions.length ? availableRoleOptions[0].value : ROLE_OPTIONS[0]?.value ?? 0;
    append({ roleId: newRoleId, count: 0 });
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card/50 dark:bg-card p-4 md:p-5 ring-1 ring-black/5">
      <FormLabel className="text-base font-semibold block">Role requirements</FormLabel>
      <p className="text-xs text-muted-foreground -mt-2">Add each role once and set the number needed for this shift.</p>
      {fields.map((field, index) => {
        const currentCount = Number(rows?.[index]?.count ?? 0);
        const selectedRoleId = Number(rows?.[index]?.roleId ?? 0);
        const options = [
          ...availableRoleOptions,
          ...(ROLE_OPTIONS.find((o) => o.value === selectedRoleId) ? [ROLE_OPTIONS.find((o) => o.value === selectedRoleId)!] : []),
        ] as { label: string; value: number }[];
        return (
          <div key={field.id} className="flex items-center space-x-3">
            <Controller
              name={`${name}.${index}.roleId`}
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field: selectField, fieldState: { error } }) => (
                <div className="flex-1">
                  <ShiftSelect
                    options={options}
                    value={Number(selectField.value) || 0}
                    onChange={(e) => selectField.onChange(Number(e.target.value))}
                    placeholder="Select Role"
                  />
                  {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
                </div>
              )}
            />

            <div className="flex items-center space-x-1">
              <Button type="button" variant="outline" size="icon" onClick={() => handleCountChange(index, -1)} disabled={currentCount <= 0}>
                <Minus className="h-4 w-4" />
              </Button>
              <Controller
                name={`${name}.${index}.count`}
                control={control}
                rules={{ required: true, min: 0 }}
                render={({ field: countField }) => (
                  <Input {...countField} type="number" min="0" className="w-16 text-center" onChange={(e) => countField.onChange(Number(e.target.value))} />
                )}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => handleCountChange(index, 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50 focus:bg-red-100">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <div className="flex items-center justify-between">
        <Button type="button" variant="default" onClick={handleAppend} className="bg-teal-600 hover:bg-teal-700" disabled={fields.length >= ROLE_OPTIONS.length}>
          Add Role Requirement
        </Button>
        {fields.length >= ROLE_OPTIONS.length && <p className="text-sm text-red-500">All available roles have been added.</p>}
      </div>
    </div>
  );
}
