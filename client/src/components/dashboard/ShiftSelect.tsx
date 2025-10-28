import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { label: string; value: number }[];
  placeholder?: string;
};

const ShiftSelect = React.forwardRef<HTMLSelectElement, Props>(
  ({ options, placeholder, value, onChange, className = "", ...props }, ref) => (
    <select
      ref={ref}
      value={value as any}
      onChange={onChange}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <option value={0} disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
);

export default ShiftSelect;
