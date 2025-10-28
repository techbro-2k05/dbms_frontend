import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Member } from "@/hooks/AuthContext";
import ManagerLocationShifts from "./ManagerLocationShifts";
import NewShiftDialog from "./NewShiftDialog";

interface ShiftProps { user: Member | null }

export default function NewShiftForm({ user }: ShiftProps) {
  const [showForm, setShowForm] = useState(false);

  if (user?.type === "MANAGER") {
    return (
      <Card data-testid="new-shift-form">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display title-gradient text-2xl">All Shifts</CardTitle>
            <NewShiftDialog open={showForm} onOpenChange={setShowForm} defaultLocationId={user?.worksAt ?? 0} />
            <Button variant="outline" onClick={() => setShowForm(true)}>Allocate Shift</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ManagerLocationShifts worksAt={user?.worksAt ?? 0} />
        </CardContent>
      </Card>
    );
  } else if (user?.type === "ADMIN") {
    return (
      <Card data-testid="new-shift-form">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Shifts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Create and assign new shifts to users. All fields are required.</div>
        </CardContent>
      </Card>
    );
  }
  return null;
}