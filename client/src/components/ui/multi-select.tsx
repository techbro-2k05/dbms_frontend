// components/ui/MultiSelect.tsx (or similar file)
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils" // Utility function for conditional class names
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Define the shape of your options
interface Option {
  label: string;
  value: number; // The value is an integer, matching your schema
}

interface MultiSelectProps {
  options: Option[];
  value: number[]; // Array of selected integer values
  onChange: (value: number[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  // Logic to handle adding/removing an item from the array
  const handleSelect = (selectedValue: number) => {
    // Determine if the value is currently in the array
    const isSelected = value.includes(selectedValue)
    
    let newValue: number[]
    
    if (isSelected) {
      // REMOVE: Filter out the selected value
      newValue = value.filter((v) => v !== selectedValue)
    } else {
      // ADD: Add the selected value to the end
      newValue = [...value, selectedValue]
    }
    
    // Call the form's onChange handler with the new array
    onChange(newValue)
    setOpen(false)
  }

  // Get the labels of the selected items for display
  const selectedLabels = value.map(
    (v) => options.find((o) => o.value === v)?.label
  ).filter(Boolean).join(", ")
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value.length > 0 ? selectedLabels : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}