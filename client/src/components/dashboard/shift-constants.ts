export type SimpleOption = { label: string; value: number };

export const LOC_OPTIONS: SimpleOption[] = [
  { value: 1, label: "12A, Maple Street, Mumbai 400001" },
  { value: 2, label: "7B, Oak Avenue, Pune 411001" },
  { value: 3, label: "101, Cedar Lane, Bengaluru 560001" },
  { value: 4, label: "45, Pine Road, Chennai 600001" },
  { value: 5, label: "9C, Birch Boulevard, Kolkata 700001" },
];

export const ROLE_OPTIONS: SimpleOption[] = [
  { label: "MANAGER", value: 1 },
  { label: "ELECTRICIAN", value: 2 },
  { label: "CARPENTER", value: 3 },
  { label: "PLUMBER", value: 4 },
  { label: "SECURITY_GUARD", value: 5 },
  { label: "CLEANER", value: 6 },
  { label: "RECEPTIONIST", value: 7 },
  { label: "SUPERVISOR", value: 8 },
  { label: "TECHNICIAN", value: 9 },
];

export const roleLabel = (id: number) => ROLE_OPTIONS.find(r => r.value === Number(id))?.label || `ROLE_${id}`;
export const locationLabel = (id: number) => LOC_OPTIONS.find(o => o.value === Number(id))?.label;
