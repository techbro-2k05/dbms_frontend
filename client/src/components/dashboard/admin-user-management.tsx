import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
// import AddUserForm from "@/components/dashboard/add-user-form";

export default function AdminUserManagement(){
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });
  const users = Array.isArray(data) ? data : [];
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PATCH", `/api/employees/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setEditUserId(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
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
    <Card>
      <CardHeader>
        <CardTitle>User Directory</CardTitle>
      </CardHeader>
      <CardContent>
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
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                  ) : (
                    user.name
                  )}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.type} onChange={e => setEditData({ ...editData, type: e.target.value })} />
                  ) : (
                    user.type
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} />
                  ) : (
                    user.location
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })} />
                  ) : (
                    user.role
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Button size="sm" onClick={handleSave}>Save</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>Edit</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => deleteUserMutation.mutate(user.id)} className="ml-2">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
