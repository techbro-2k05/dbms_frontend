import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type AdminUserManagementProps = {
  hideBackButton?: boolean;
  className?: string;
};

export default function AdminUserManagement({ hideBackButton = false, className }: AdminUserManagementProps) {
  const { toast } = useToast();
  
  // Fetch all members from backend
  const { data: members, isLoading } = useQuery({
    queryKey: ["/members"],
    queryFn: async () => {
      const response = await api.get('/members');
      return response.data;
    },
  });
  
  const users = Array.isArray(members) ? members : [];
  
  // ---- Filters state ----
  const [typeFilter, setTypeFilter] = useState<string>("ALL"); // ALL | ADMIN | MANAGER | MEMBER
  const [locationFilter, setLocationFilter] = useState<string>(""); // exact worksAt match

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const typeOk = typeFilter === "ALL" ? true : String(u.type) === typeFilter;
      const locOk = locationFilter.trim() === "" ? true : String(u.worksAt ?? "") === locationFilter.trim();
      return typeOk && locOk;
    });
  }, [users, typeFilter, locationFilter]);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Update user mutation - PUT /members/{id}
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await api.put(`/members/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/members"] });
      setEditUserId(null);
      toast({
        title: "Success",
        description: "User updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to update user",
      });
    },
  });

  // Delete user mutation - DELETE /members/{id}
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/members/${id}`, { withCredentials: true });
      return id;
    },
    onSuccess: (deletedId: number) => {
      // Optimistically remove the user from cache for snappier UX
      queryClient.setQueryData(["/members"], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter((u: any) => u.id !== deletedId);
      });
      // Also invalidate to refetch and stay authoritative
      queryClient.invalidateQueries({ queryKey: ["/members"] });
      toast({
        title: "Success",
        description: "User deleted successfully!",
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.status === 404
        ? "User not found or already deleted"
        : error?.response?.data?.message || "Failed to delete user";
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
    },
  });

  const handleEdit = (user: any) => {
    setEditUserId(user.id);
    setEditData(user);
  };

  const handleSave = () => {
    updateUserMutation.mutate(editData);
  };

  return (
    <div>
    {!hideBackButton && (
      <div className="absolute top-14 right-14 z-10">
        <Button asChild variant="outline" className="text-sm">
          <a href="/admin-dashboard">&larr; Back</a>
        </Button>
      </div>
    )}
    <Card className={className ? className : "card-elevated"}>
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-3xl title-gradient">User Directory</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">User Type</label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="MEMBER">MEMBER</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Location ID</label>
            <Input
              placeholder="e.g. 1"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => { setTypeFilter("ALL"); setLocationFilter(""); }}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        ) : (
          <Table className="rounded-xl overflow-hidden">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location ID</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Feasible Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&>tr:nth-child(odd)]:bg-muted/20">
              {filteredUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.id}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="First"
                          value={editData.fname ?? ""}
                          onChange={(e) => setEditData({ ...editData, fname: e.target.value })}
                        />
                        <Input
                          placeholder="Middle"
                          value={editData.mname ?? ""}
                          onChange={(e) => setEditData({ ...editData, mname: e.target.value })}
                        />
                        <Input
                          placeholder="Last"
                          value={editData.lname ?? ""}
                          onChange={(e) => setEditData({ ...editData, lname: e.target.value })}
                        />
                      </div>
                    ) : (
                      `${user.fname ?? ''}${user.mname ? ' ' + user.mname : ''}${user.lname ? ' ' + user.lname : ''}`.trim()
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input
                        value={editData.type}
                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                      />
                    ) : (
                      user.type
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input
                        type="number"
                        value={editData.worksAt}
                        onChange={(e) => setEditData({ ...editData, worksAt: parseInt(e.target.value) })}
                      />
                    ) : (
                      user.worksAt
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input
                        value={editData.gender}
                        onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                      />
                    ) : (
                      user.gender
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    ) : (
                      user.phone
                    )}
                  </TableCell>
                  <TableCell>
                    {String(user.type) === "MEMBER" && Array.isArray(user.feasibleRoles) && user.feasibleRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.feasibleRoles.map((rid: number, idx: number) => (
                          <Badge key={`${user.id}-role-${idx}`} variant="secondary">
                            {roleLabel(rid)} #{rid}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editUserId === user.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={updateUserMutation.isPending}
                          >
                            {updateUserMutation.isPending ? "Saving..." : "Save"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditUserId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${user.fname} ${user.lname}?`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
    </div>
  );
}

// --- Role label helper ---
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

function roleLabel(id: number): string {
  return ROLE_LABELS[id] || `ROLE_${id}`;
}
