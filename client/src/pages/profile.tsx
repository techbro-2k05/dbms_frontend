import { useAuth } from "@/hooks/AuthContext";
import React from "react";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const { toast } = useToast();
  const fullName = [user.fname, user.mname, user.lname].filter(Boolean).join(" ");
  const ROLE_LABELS: Record<number, string> = {
    1: "MANAGER",
    2: "ELECTRICIAN",
    3: "CARPENTER",
    4: "PLUMBER",
    5: "SECURITY_GUARD",
    6: "CLEANER",
    7: "RECEPTIONIST",
    8: "SUPERVISOR",
    9: "TECHNICIAN",
  };
  const LOCATION_LABELS: Record<number, string> = {
    1: "12A, Maple Street, Mumbai 400001",
    2: "7B, Oak Avenue, Pune 411001",
    3: "101, Cedar Lane, Bengaluru 560001",
    4: "45, Pine Road, Chennai 600001",
    5: "9C, Birch Boulevard, Kolkata 700001",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background" data-testid="page-profile">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-50 via-indigo-50/60 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
          <div className="max-w-4xl mx-auto space-y-6">
            <section>
              <h1 className="font-display text-4xl font-bold tracking-tight title-gradient">My Profile</h1>
              <p className="mt-2 text-muted-foreground">View your account and employment details</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
                      {user.fname?.charAt(0) ?? "U"}
                    </div>
                    <div>
                      <div className="text-lg font-medium">{fullName || `User #${user.id}`}</div>
                      <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between py-1"><span className="text-muted-foreground">Role</span><span>{user.type}</span></div>
                    <div className="flex justify-between py-1"><span className="text-muted-foreground">Gender</span><span>{user.gender || "-"}</span></div>
                    <div className="flex justify-between py-1"><span className="text-muted-foreground">Phone</span><span>{user.phone || user.phoneNumber || "-"}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle>Employment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between py-1"><span className="text-muted-foreground">Location ID</span><span>{user.worksAt ?? "-"}</span></div>
                  <div className="flex justify-between py-1"><span className="text-muted-foreground">Location Address</span><span>{user.worksAt ? LOCATION_LABELS[user.worksAt] ?? "-" : "-"}</span></div>
                  <div className="flex justify-between py-1"><span className="text-muted-foreground">Allowed Paid Leaves</span><span>{user.allowedPaidLeaves ?? "-"}</span></div>
                  <div className="flex justify-between py-1"><span className="text-muted-foreground">Allowed Hours</span><span>{user.allowedHours ?? "-"}</span></div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle>Feasible Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(user.feasibleRoles) && user.feasibleRoles.length > 0 ? (
                      user.feasibleRoles.map((r, idx) => (
                        <Badge key={`${r}-${idx}`} variant="secondary">
                          {(ROLE_LABELS[r as number] ?? "Role") + ` #${r}`}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No additional roles assigned</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Editable Profile Fields (frontend-only) */}
              <Card className="md:col-span-2 card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle>Update Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget as HTMLFormElement);
                      const payload = {
                        fName: String(formData.get("fName") || ""),
                        mName: String(formData.get("mName") || ""),
                        lName: String(formData.get("lName") || ""),
                        apartment: String(formData.get("apartment") || ""),
                        city: String(formData.get("city") || ""),
                        phone: String(formData.get("phone") || ""),
                      };
                      console.log("UpdateMemberRequest (frontend only):", payload);
                      toast({
                        title: "Profile form saved locally",
                        description: "No server request sent. Backend wiring coming soon.",
                      });
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fName">First Name</Label>
                        <Input id="fName" name="fName" defaultValue={user.fname || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mName">Middle Name</Label>
                        <Input id="mName" name="mName" defaultValue={user.mname || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lName">Last Name</Label>
                        <Input id="lName" name="lName" defaultValue={user.lname || ""} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="apartment">Apartment</Label>
                        <Input id="apartment" name="apartment" placeholder="Flat / House No." defaultValue="" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" placeholder="Your city" defaultValue="" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" placeholder="Contact number" defaultValue="" />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
