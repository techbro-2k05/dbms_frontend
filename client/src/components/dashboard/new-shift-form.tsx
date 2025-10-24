import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react"; 
import { User } from "@shared/schema";
// import WeeklyShiftForm from "./assign-weekly"; // Note: This line remains commented out as requested
import { ShiftService } from "@/services/api";

// --- EXTERNAL OPTIONS ---
const LOC_OPTIONS = [
    { label: "Mumbai", value: 1 },
    { label: "Delhi", value: 2 },
    { label: "Noida", value: 3 },
    { label: "Banglore", value: 4 },
];

const ROLE_OPTIONS = [
    { label: "Role A", value: 1 },
    { label: "Role B", value: 2 },
    { label: "Role C", value: 3 },
    { label: "Role D", value: 4 },
];

// --- TYPE DEFINITIONS ---
type Requirement = {
    roleId: number;
    count: number;
};

type FormValues = {
    title: string;
    day: string;
    startTime: string;
    endTime: string;
    locationId: number;
    requirements: Requirement[]; // Dynamic array of role requirements
};

interface ShiftProps {
    user: User | null;
}

// --- SELECT COMPONENT PLACEHOLDER (Using native select with Tailwind classes) ---
const SelectComponent = React.forwardRef(({ value, onChange, options, placeholder, ...props }, ref) => (
    <select
        ref={ref}
        value={value}
        onChange={onChange}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
    >
        <option value={0} disabled>{placeholder}</option>
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
));


// --- DYNAMIC ROLE AND COUNT FIELD COMPONENT ---
const RoleCountArrayField = ({ control, name }) => {
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: name,
    });

    const rolesWatch = control._formValues[name] || [];
    const usedRoleIds = rolesWatch.map(field => field.roleId).filter(Boolean);
    
    // Available options are those not currently selected in the array
    const availableRoleOptions = ROLE_OPTIONS.filter(option => !usedRoleIds.includes(option.value));


    const handleCountChange = (index, currentField, delta) => {
        // Ensure count is never negative
        const newCount = Math.max(0, currentField.count + delta);
        update(index, { ...currentField, count: newCount });
    };

    const handleAppend = () => {
        // Prevent adding more rows than there are roles available
        if (fields.length >= ROLE_OPTIONS.length) return;
        
        // Suggest the first available role ID for the new row
        const newRoleId = availableRoleOptions.length > 0 ? availableRoleOptions[0].value : (ROLE_OPTIONS.length > 0 ? ROLE_OPTIONS[0].value : 0);

        append({ roleId: newRoleId, count: 0 });
    };

    return (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
            <FormLabel className="text-base font-semibold block">Required Roles & Quantity</FormLabel>

            {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3">
                    {/* Role Select Dropdown */}
                    <Controller
                        name={`${name}.${index}.roleId`}
                        control={control}
                        rules={{ required: "Role is required" }}
                        render={({ field: selectField, fieldState: { error } }) => (
                            <div className="flex-1">
                                <SelectComponent
                                    // Filter options to show only available roles + the currently selected role
                                    options={[
                                        ...availableRoleOptions, 
                                        ROLE_OPTIONS.find(o => o.value === selectField.value)
                                    ].filter(Boolean)} 
                                    value={selectField.value || 0}
                                    onChange={(e) => selectField.onChange(Number(e.target.value))}
                                    placeholder="Select Role"
                                />
                                {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
                            </div>
                        )}
                    />

                    {/* Count Controls */}
                    <div className="flex items-center space-x-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleCountChange(index, field, -1)}
                            disabled={field.count <= 0}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        
                        {/* Count Display/Input */}
                        <Controller
                            name={`${name}.${index}.count`}
                            control={control}
                            rules={{ required: true, min: 0 }}
                            render={({ field: countField }) => (
                                <Input
                                    {...countField}
                                    type="number"
                                    min="0"
                                    className="w-16 text-center"
                                    onChange={(e) => countField.onChange(Number(e.target.value))}
                                />
                            )}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleCountChange(index, field, 1)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:bg-red-50 focus:bg-red-100"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            
            {/* Add Role Button */}
            <Button
                type="button"
                variant="default"
                onClick={handleAppend}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={fields.length >= ROLE_OPTIONS.length}
            >
                Add Role Requirement
            </Button>
            {fields.length >= ROLE_OPTIONS.length && (
                <p className="text-sm text-red-500">All available roles have been added.</p>
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
export default function NewShiftForm({ user }: ShiftProps) {
    const [showForm, setShowForm] = useState(false);
    
    const form = useForm<FormValues>({
        defaultValues: {
            title: "",
            day: "",
            startTime: "",
            endTime: "",
            locationId: 0,
            // Initialize with one default requirement row
            requirements: [{ roleId: ROLE_OPTIONS[0].value, count: 1 }], 
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
             const cleanedRequirements = values.requirements
                .filter(req => req.count > 0 && req.roleId !== 0)
                .map(req => ({
                    roleId: req.roleId,
                    count: req.count,
                    // Explicitly exclude any internal RHF properties like 'id'
                }));

            const payload = {
                title: values.title?.trim(),
                day: values.day.trim(),
                startTime: values.startTime.trim(),
                endTime: values.endTime.trim(),
                locationId: values.locationId,
                requirements: cleanedRequirements, // Use the cleaned array
            };

            alert("Shift creation payload (Simulated):\n" + JSON.stringify(payload, null, 2));
            await ShiftService.create(payload);
            alert("Shift created successfully");
            form.reset();
            setShowForm(false);
        } catch (error) {
            console.error("Create shift failed:", error);
            const msg = error?.response?.data?.message || error?.message || "Unknown error";
            alert("Failed to create shift: " + msg);
        }
    };

    if (user?.type === "MANAGER") {
        return (
            <Card data-testid="new-shift-form">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>New Shift Allocation</CardTitle>
                        {/* WeeklyShiftForm component removed */}
                        <Dialog open={showForm} onOpenChange={setShowForm}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Allocate Shift</Button>
                            </DialogTrigger>
                            <DialogContent 
                                className="max-w-xl h-[90vh] overflow-y-auto" // ADDED SCROLLING CLASSES
                            >
                                <DialogHeader>
                                    <DialogTitle>Allocate New Shift</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Title */}
                                            <FormField
                                                control={form.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Title</FormLabel>
                                                        <FormControl><Input {...field} required /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Day */}
                                            <FormField
                                                control={form.control}
                                                name="day"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Date</FormLabel>
                                                        <FormControl><Input type="date" {...field} required /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Start Time */}
                                            <FormField
                                                control={form.control}
                                                name="startTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Start Time</FormLabel>
                                                        <FormControl><Input type="time" {...field} required /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* End Time */}
                                            <FormField
                                                control={form.control}
                                                name="endTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>End Time</FormLabel>
                                                        <FormControl><Input type="time" {...field} required /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Location ID (Single Select) */}
                                            <FormField
                                                control={form.control}
                                                name="locationId"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Location ID</FormLabel>
                                                        <FormControl>
                                                            <SelectComponent
                                                                options={LOC_OPTIONS}
                                                                value={String(field.value || 0)}
                                                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                                                placeholder="Select Location"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* --- DYNAMIC ROLE REQUIREMENTS FIELD --- */}
                                        <FormItem>
                                            <FormControl>
                                                <RoleCountArrayField 
                                                    control={form.control}
                                                    name="requirements"
                                                />
                                            </FormControl>
                                        </FormItem>
                                        

                                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Allocate Shift'}
                                        </Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground">Create and assign new shifts to users. All fields are required.</div>
                </CardContent>
            </Card>
        );
    } else if (user?.type === "ADMIN") {
        return (
            <Card data-testid="new-shift-form">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>New Shift Allocation</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground">Create and assign new shifts to users. All fields are required.</div>
                </CardContent>
            </Card>
        );
    }
}