import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { UserService } from "@/services/api";

type MemberDto = {
  id: number;
  fname: string;
  mname?: string;
  lname?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  apartment?: string;
  city?: string;
  // ...other backend fields
};

type FrontendUser = {
  id: number;
  name: string | null;
  username: string; // mapped from id as requested
  type: string | null;
  location: string | null;
  role: string | null;
  __raw?: MemberDto; // keep raw DTO in case it's needed
};

export default function AdminUserManagement() {
  const { user: currentUser } = useAuth();

  // fetch members and map them to the frontend user shape
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["/members"],
    queryFn: async () => {
      const res = await UserService.getAll();
      const members: MemberDto[] = Array.isArray(res.data) ? res.data : [];
      const mapped: FrontendUser[] = members.map((m) => ({
        id: m.id,
        name: m.fname ?? null,
        username: String(m.id), // as requested: username with id
        type: null,
        location: null,
        role: null,
        __raw: m,
      }));
      return mapped;
    },
    // optional: staleTime / cacheTime adjustments here
  });

  const users: FrontendUser[] = Array.isArray(data) ? data : [];

  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<FrontendUser>>({});

  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleEdit = (u: FrontendUser) => {
    setEditUserId(u.id);
    // keep shallow copy for editing
    setEditData({ ...u });
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditData({});
  };

  // convert frontend editData to backend DTO shape expected by API
  const buildPayloadForBackend = (edited: Partial<FrontendUser>) => {
    const payload: any = {};
    // map name -> fName if present
    if (edited.name !== undefined) payload.fName = edited.name;
    // if you later allow editing apartment/city from frontend, map them here to apartment/city
    // currently we only send fName since other backend fields aren't represented
    return payload;
  };

  const handleSave = async () => {
    if (editUserId === null) return;
    const id = editUserId;
    try {
      setSavingId(id);
      const payload = buildPayloadForBackend(editData);
      // send only the DTO fields backend expects
      await UserService.update(id, payload);
      await queryClient.invalidateQueries({ queryKey: ["/members"] });
      setEditUserId(null);
      setEditData({});
    } catch (err: any) {
      console.error("Update failed:", err);
      alert("Failed to update user: " + (err?.message || "Unknown error"));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setDeletingId(id);
      await UserService.delete(id);
      await queryClient.invalidateQueries({ queryKey: ["/members"] });
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert("Failed to delete user: " + (err?.message || "Unknown error"));
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>Loading users…</CardContent>
      </Card>
    );
  }

  if (isError) {
    console.error(error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>Error loading users. Check console for details.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Directory</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div>No users found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    {editUserId === u.id ? (
                      <Input
                        value={editData.name ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />
                    ) : (
                      u.name ?? "—"
                    )}
                  </TableCell>

                  <TableCell>{u.username}</TableCell>

                  <TableCell>
                    {editUserId === u.id ? (
                      <Input
                        value={editData.type ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, type: e.target.value })
                        }
                      />
                    ) : (
                      u.type ?? "—"
                    )}
                  </TableCell>

                  <TableCell>
                    {editUserId === u.id ? (
                      <Input
                        value={editData.location ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, location: e.target.value })
                        }
                      />
                    ) : (
                      u.location ?? "—"
                    )}
                  </TableCell>

                  <TableCell>
                    {editUserId === u.id ? (
                      <Input
                        value={editData.role ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, role: e.target.value })
                        }
                      />
                    ) : (
                      u.role ?? "—"
                    )}
                  </TableCell>

                  <TableCell>
                    {editUserId === u.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={savingId !== null}
                        >
                          {savingId === u.id ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="ml-2"
                          disabled={savingId !== null}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(u)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(u.id)}
                          className="ml-2"
                          disabled={deletingId !== null}
                        >
                          {deletingId === u.id ? "Deleting..." : "Delete"}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
